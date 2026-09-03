import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const patientData = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured in environment variables.");
    }

    const systemPrompt = `
      You are an elite, highly experienced emergency room triage physician.
      You are evaluating a new patient case submitted through an automated clinical intake kiosk.
      
      Below is the raw JSON data containing the patient's demographics, verified ABHA profile, interactive body map location, voice interview transcriptions, and uploaded documents.
      
      Patient Data:
      ${JSON.stringify(patientData, null, 2)}
      
      Analyze this case deeply. Synthesize a professional, doctor-ready clinical summary.
      
      You MUST return exactly a JSON object with the following schema:
      {
        "triageLevel": "Low" | "Medium" | "High" | "Critical",
        "clinicalSummary": "A highly professional, concise medical summary of the patient's presentation (History of Present Illness style).",
        "differentialDiagnosis": ["3-5 possible medical conditions or diagnoses based on the symptoms"],
        "recommendedQuestions": ["2-3 specific clinical questions a doctor should ask next to narrow down the diagnosis"]
      }
      Do NOT wrap the JSON in markdown code blocks. Output ONLY the raw JSON object.
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze the patient case and provide the structured clinical synthesis.' }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API Error:", errText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const aiResponseText = data.choices[0].message.content;
    const aiAnalysis = JSON.parse(aiResponseText);

    return NextResponse.json(aiAnalysis);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: 'Failed to analyze patient case' }, { status: 500 });
  }
}
