import { NextResponse } from 'next/server';

const LANG_CODES: Record<string, string> = {
  Hindi: 'hi',
  Nepali: 'ne',
  Bengali: 'bn',
  English: 'en',
  Tamil: 'ta',
  Telugu: 'te',
  Marathi: 'mr',
  Kannada: 'kn',
  Malayalam: 'ml',
};

// Common Kiosk static translation dictionary for instant zero-latency translations
const COMMON_DICTIONARY: Record<string, Record<string, string>> = {
  Hindi: {
    "Tell us how you're feeling.": "हमें बताएं कि आप कैसा महसूस कर रहे हैं।",
    "We'll listen.": "हम सुनेंगे।",
    "A few calm questions before you see the doctor. Speak, tap, or both — at your pace.": "डॉक्टर से मिलने से पहले कुछ आसान सवाल। बोलें, टैप करें या दोनों — अपनी गति से।",
    "Get started": "शुरू करें",
    "I have an ABHA ID": "मेरे पास आभा आईडी है",
    "I'm new here": "मैं नया हूँ",
    "A quick word of trust": "विश्वास की एक छोटी सी बात",
    "We'll only ask what helps the doctor understand you today. You can skip anything that feels too much.": "हम केवल वही पूछेंगे जो आज डॉक्टर को आपको समझने में मदद करे। आप कुछ भी छोड़ सकते हैं।",
    "Your story, in your words": "आपकी बात, आपके शब्दों में",
    "Papers, if you have them": "दस्तावेज़, यदि आपके पास हैं",
    "Stays in this hospital": "इस अस्पताल में सुरक्षित रहता है",
    "I understand & continue": "मैं समझ गया, आगे बढ़ें",
    "Please select your preferred language": "कृपया अपनी पसंदीदा भाषा चुनें",
    "Your entire intake experience will be translated in real-time.": "आपकी पूरी जानकारी का अनुवाद वास्तविक समय में किया जाएगा।",
    "Scan your ABHA Card": "अपना आभा कार्ड स्कैन करें",
    "Point your QR code at the camera or skip to manual entry": "अपना क्यूआर कोड कैमरे की ओर दिखाएं या आगे बढ़ें",
    "Skip for now": "अभी के लिए छोड़ें",
    "What brings you here today?": "आज आप किस समस्या के लिए आए हैं?",
    "Select your primary health concerns or tap below to describe": "अपनी मुख्य स्वास्थ्य समस्या चुनें या नीचे बताएं",
    "Describe your symptoms...": "अपने लक्षणों का वर्णन करें...",
    "Voice Input": "आवाज़ से बताएं",
    "Type Answer": "लिखकर बताएं",
    "Next": "आगे बढ़ें",
    "Back": "पीछे जाएँ",
    "Submit": "जमा करें",
    "Review Case Summary": "केस सारांश की समीक्षा करें",
    "Intake Complete": "पंजीकरण पूर्ण हुआ",
  }
};

async function translateMyMemory(text: string, targetLangCode: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLangCode}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    return (translated && typeof translated === 'string') ? translated : text;
  } catch {
    return text;
  }
}

export async function POST(req: Request) {
  try {
    const { texts, targetLanguage } = await req.json();

    if (!Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return NextResponse.json({ error: 'texts[] and targetLanguage are required' }, { status: 400 });
    }

    if (targetLanguage === 'English') {
      return NextResponse.json({ translations: texts });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // Try Groq API if API Key exists
    if (apiKey) {
      try {
        const systemPrompt = `
          You are a professional medical UI translator for an Indian hospital kiosk.
          Translate each string in the given JSON array into ${targetLanguage}.
          Rules:
          - Return exact same array length and order.
          - Use natural, polite, patient-friendly ${targetLanguage}.
          - Do NOT translate proper nouns (ABHA, MediKiosk, M), numbers, or technical brand codes.
          - Return raw JSON format: {"translations": ["...", "..."]}
        `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: JSON.stringify(texts) }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          const translations: string[] = Array.isArray(parsed) ? parsed : parsed?.translations;
          if (Array.isArray(translations) && translations.length === texts.length) {
            return NextResponse.json({ translations });
          }
        }
      } catch (e) {
        console.warn("Groq translate failed, using fallback translation service:", e);
      }
    }

    // Fallback translation strategy: Dictionary -> MyMemory API
    const targetLangCode = LANG_CODES[targetLanguage] || 'hi';
    const dict = COMMON_DICTIONARY[targetLanguage] || {};

    const translations = await Promise.all(
      texts.map(async (str) => {
        if (!str || typeof str !== 'string') return str;
        if (dict[str]) return dict[str];
        return await translateMyMemory(str, targetLangCode);
      })
    );

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Translation Endpoint Exception:", error);
    return NextResponse.json({ translations: [] }, { status: 200 });
  }
}
