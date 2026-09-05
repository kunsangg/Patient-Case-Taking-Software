import { NextResponse } from 'next/server';

export interface GeneratedQuestion {
  id: string;
  text: string;
  options: string[];
}

export async function POST(req: Request) {
  try {
    const { chiefComplaint, language = "English", history = {} } = await req.json();

    const symptomText = Array.isArray(chiefComplaint)
      ? chiefComplaint.map((c: { symptom?: string } | string) => (typeof c === 'string' ? c : c.symptom || '')).filter(Boolean).join(', ')
      : chiefComplaint || "General malaise";

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.warn("GROQ_API_KEY is missing. Generating intelligent complaint-based fallback questions.");
      return NextResponse.json({
        questions: getFallbackQuestions(symptomText, language)
      });
    }

    const systemPrompt = `
      You are an expert clinical triage physician for an emergency room & outpatient intake kiosk.
      A patient has stated their primary complaint: "${symptomText}".
      Preferred Language: ${language}.
      Previous history recorded so far: ${JSON.stringify(history)}.

      Generate 5 to 6 personalized, highly targeted clinical follow-up questions to perform a deep, comprehensive medical analysis of their condition before seeing the doctor.

      Requirements:
      1. Tailor every question specifically to "${symptomText}" covering clinical domains: Onset & Duration, Character/Quality of Pain, Severity & Progression, Location & Radiation, Aggravating/Relieving Factors, and Associated Systemic Symptoms.
      2. Phrase questions with high empathy and clarity suitable for a patient kiosk interface.
      3. For each question, provide 4-5 quick-select answer options.
      4. Format the output strictly as a JSON object matching this schema:
      {
        "questions": [
          {
            "id": "short_unique_id",
            "text": "Question text in ${language}",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
          }
        ]
      }
      Output ONLY valid JSON. Do not include markdown code block backticks.
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
          { role: 'user', content: `Generate 5-6 comprehensive clinical intake questions for patient presenting with ${symptomText}.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq Questions API Error:", errText);
      return NextResponse.json({ questions: getFallbackQuestions(symptomText, language) });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to generate Groq questions:", error);
    return NextResponse.json({ questions: getFallbackQuestions("General malaise", "English") });
  }
}

function getFallbackQuestions(symptom: string, _language: string): GeneratedQuestion[] {
  const lower = symptom.toLowerCase();

  if (lower.includes("chest") || lower.includes("heart")) {
    return [
      {
        id: "duration",
        text: `When did your ${symptom} first start?`,
        options: ["Less than 1 hour ago", "Earlier today", "1-2 days ago", "More than a week ago"]
      },
      {
        id: "character",
        text: "How does the chest discomfort feel?",
        options: ["Squeezing / Heavy pressure", "Sharp / Stabbing", "Burning sensation", "Dull ache", "Tightness"]
      },
      {
        id: "radiation",
        text: "Does the discomfort spread anywhere else?",
        options: ["Left arm / Shoulder", "Jaw / Neck", "Back", "Stomach", "Stays in chest center"]
      },
      {
        id: "aggravating",
        text: "What makes the chest discomfort worse?",
        options: ["Physical exertion / Walking", "Deep breathing / Coughing", "Lying flat", "Pressing on chest", "Nothing specific"]
      },
      {
        id: "associated",
        text: "Are you experiencing any accompanying symptoms?",
        options: ["Shortness of breath", "Cold sweats / Dizziness", "Nausea", "Heart palpitations", "None of these"]
      },
      {
        id: "past_history",
        text: "Do you have any personal or family history of heart issues?",
        options: ["High blood pressure", "Diabetes", "Previous heart condition", "High cholesterol", "None known"]
      }
    ];
  }

  if (lower.includes("head") || lower.includes("migraine")) {
    return [
      {
        id: "onset",
        text: "How suddenly did this headache start?",
        options: ["Sudden like a thunderclap", "Gradual over hours", "Built up over several days", "Woke up with it"]
      },
      {
        id: "quality",
        text: "What type of pain are you experiencing?",
        options: ["Throbbing / Pulsating", "Constant pressure", "Sharp or stabbing", "Tight band around head"]
      },
      {
        id: "location",
        text: "Where is the headache located?",
        options: ["One side of head", "Frontal / Forehead", "Back of head & neck", "Behind eyes", "All over head"]
      },
      {
        id: "triggers",
        text: "Are any of these making the headache worse?",
        options: ["Bright lights / Noise", "Moving head or coughing", "Screen time", "Stress or lack of sleep", "Nothing specific"]
      },
      {
        id: "associated",
        text: "Are you having any accompanying symptoms?",
        options: ["Nausea / Vomiting", "Visual spots or aura", "Neck stiffness", "Dizziness", "None"]
      },
      {
        id: "frequency",
        text: "How often do you get headaches like this?",
        options: ["First time ever", "Once a month or less", "Weekly", "Almost daily"]
      }
    ];
  }

  if (lower.includes("stomach") || lower.includes("abdomen") || lower.includes("abdominal") || lower.includes("belly")) {
    return [
      {
        id: "location",
        text: "Which part of your stomach hurts the most?",
        options: ["Upper stomach (near ribs)", "Around belly button", "Lower right side", "Lower left side", "All over"]
      },
      {
        id: "timing",
        text: "Is the pain related to eating or meals?",
        options: ["Worse right after eating", "Better after eating", "Worse on empty stomach", "Worse with fatty foods", "No relation to food"]
      },
      {
        id: "character",
        text: "How would you describe the stomach pain?",
        options: ["Cramping / Spasms", "Sharp or burning", "Dull constant ache", "Bloated / Fullness"]
      },
      {
        id: "severity",
        text: "How severe is the pain right now?",
        options: ["Mild - Tolerable", "Moderate - Disrupts activity", "Severe - Hard to stand", "Extreme distress"]
      },
      {
        id: "associated",
        text: "Are you experiencing any digestive symptoms?",
        options: ["Nausea or vomiting", "Diarrhea or loose stools", "Constipation", "Fever or chills", "Loss of appetite"]
      },
      {
        id: "relief",
        text: "Does anything bring relief?",
        options: ["Antacids / Medicine", "Bowel movement", "Resting or lying down", "Applying heat", "Nothing helps"]
      }
    ];
  }

  if (lower.includes("fever") || lower.includes("temperature") || lower.includes("chills")) {
    return [
      {
        id: "duration",
        text: "How long have you had a fever?",
        options: ["Started today", "2-3 days", "4-7 days", "More than a week"]
      },
      {
        id: "severity",
        text: "Have you measured your body temperature?",
        options: ["Below 100°F (37.8°C)", "100°F - 102°F (37.8-38.9°C)", "Above 102°F (38.9°C)", "Haven't measured"]
      },
      {
        id: "pattern",
        text: "What pattern does your fever follow?",
        options: ["Constant high temperature", "Spikes in evening", "Comes and goes with chills", "Responds to medication"]
      },
      {
        id: "respiratory",
        text: "Are you experiencing respiratory symptoms?",
        options: ["Coughing up phlegm", "Dry persistent cough", "Sore throat & difficulty swallowing", "Shortness of breath", "None"]
      },
      {
        id: "associated",
        text: "What other body symptoms are present?",
        options: ["Severe chills & shivering", "Body aches & extreme fatigue", "Headache & eye pain", "Stomach upset / Nausea", "None"]
      }
    ];
  }

  // Generic expanded clinical questionnaire
  return [
    {
      id: "onset",
      text: `When did you first notice this ${symptom}?`,
      options: ["Today", "Yesterday", "3-4 days ago", "Over a week ago", "Gradual onset over months"]
    },
    {
      id: "character",
      text: "How would you describe the feeling or nature of the discomfort?",
      options: ["Sharp / Stabbing", "Dull constant ache", "Burning / Tingling", "Throbbing / Pulsating", "Pressure / Tightness"]
    },
    {
      id: "severity",
      text: "On a scale of severity, how uncomfortable is this right now?",
      options: ["Mild - Noticeable but tolerable", "Moderate - Disrupts normal activity", "Severe - Hard to function", "Extreme - Urgent distress"]
    },
    {
      id: "aggravating",
      text: "Does anything make the discomfort worse?",
      options: ["Movement or physical exertion", "Deep breathing or coughing", "Eating or drinking", "Stress or fatigue", "Nothing specific"]
    },
    {
      id: "associated",
      text: "Are you noticing any accompanying body symptoms?",
      options: ["Fever or chills", "Dizziness or weakness", "Nausea or vomiting", "Shortness of breath", "None of these"]
    },
    {
      id: "prior_episodes",
      text: "Have you ever experienced this problem in the past?",
      options: ["First time ever", "Occasional occurrence", "Chronic ongoing issue", "Recurrent seasonal problem"]
    }
  ];
}
