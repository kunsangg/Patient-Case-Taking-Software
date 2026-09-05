import { NextResponse } from 'next/server';

// Standard high-quality ElevenLabs built-in premade voices (100% free-tier compatible)
// Bella: Warm, clear, reassuring female tone (ideal for multilingual Hindi intake)
// Adam: Professional, clear male tone (ideal for English intake)
const VOICE_MAP: Record<string, string> = {
  Hindi: 'EXAVITQu4vr4xnSDxMaL',   // Bella (Multilingual V2)
  English: 'pNInz6obpgDQGcFmaJgB', // Adam (Multilingual V2)
};

const DEFAULT_VOICE = 'EXAVITQu4vr4xnSDxMaL'; // Bella fallback

export async function POST(req: Request) {
  try {
    const { text, voiceId, language } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.warn("ELEVENLABS_API_KEY is not configured in environment variables. Falling back to browser TTS.");
      return NextResponse.json({ fallback: true }, { status: 200 });
    }

    const selectedVoice = voiceId || (language && VOICE_MAP[language]) || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ElevenLabs API Error] Voice ${selectedVoice} status ${response.status}:`, errText);
      return NextResponse.json({ fallback: true, error: errText }, { status: 200 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error("TTS API Exception:", error);
    return NextResponse.json({ fallback: true }, { status: 200 });
  }
}
