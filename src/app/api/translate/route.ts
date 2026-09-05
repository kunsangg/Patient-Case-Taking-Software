import { NextResponse } from 'next/server';

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
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured in environment variables.");
    }

    const systemPrompt = `
      You are a medical-context UI translator for a patient intake kiosk used in Indian hospitals.
      Translate each string in the given JSON array into ${targetLanguage}.

      Rules:
      - Return exactly the same number of strings, in the same order.
      - Keep tone simple, warm, and clear — this is read by patients, not clinicians.
      - Do NOT translate proper nouns, brand names ("MediKiosk", "ABHA", "MEDI-OS"), numbers, dates, or medicine names.
      - If a string is already in ${targetLanguage}, or is empty, or is not human-language text (e.g. a bare number or ID), return it unchanged.
      - Output ONLY a raw JSON object: {"translations": ["...", "...", ...]}. No markdown, no commentary.
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(texts) }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq Translate API Error:", errText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    let translations: string[] = Array.isArray(parsed) ? parsed : parsed.translations;

    // Defensive: if the model drops/adds entries, fall back to source text for safety.
    if (!Array.isArray(translations) || translations.length !== texts.length) {
      translations = texts;
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}
