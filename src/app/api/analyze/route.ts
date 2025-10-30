import { NextRequest, NextResponse } from 'next/server';
// 1. Your package import is correct.
import {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  Part,
} from '@google/genai';

const MODEL_NAME = "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  // 2. Your initialization is correct.
  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY as string });

  const responseSchema = {
    type: "OBJECT",
    properties: {
      designerNotes: {
        type: "STRING",
        description: "A brief, friendly analysis of the room's style, layout, and key features (e.g., lighting, focal points).",
      },
      questions: {
        type: "ARRAY",
        description: "A list of at least 10 questions to help the user customize their design.",
        items: {
          type: "OBJECT",
          properties: {
            question: {
              type: "STRING",
              description: "The question for the user (e.g., 'What style are you drawn to?').",
            },
            options: {
              type: "ARRAY",
              description: "A list of 3-5 concise, one-or-two-word options for the user to choose from.",
              items: {
                type: "STRING",
              },
            },
            type: {
              type: "STRING",
              description: "The type of question: 'single' for radio buttons (only one answer) or 'multiple' for checkboxes (multiple answers allowed).",
              enum: ["single", "multiple"],
            },
          },
          required: ["question", "options", "type"],
        },
      },
    },
    required: ["designerNotes", "questions"],
  };

  // 3. This object is fine, but we'll pass it inside `config`
  const generationConfig = {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
    temperature: 0.7,
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
    }

    const match = imageData.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid image data format' }, { status: 400 });
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const imagePart: Part = {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };

    // 4. System instruction should be a plain string
    const systemInstruction: string = `You are a world-class interior designer AI. Your task is to analyze the user's room image and generate a set of questions to help them redesign it.
    1.  **Analyze the image:** Briefly describe the room's current state in your "Designer's Notes".
    2.  **Identify Objects:** Identify specific objects or areas in the room (e.g., ceiling, specific furniture, windows, flooring, walls).
    3.  **Generate Detailed Questions:** Create a minimum of 10 multiple-choice questions about design preferences. Ask about the overall style, but also include specific questions about the objects you identified. For example, if you see a bed, ask about the mattress or headboard. If you see a fan, ask if it should be replaced. Be specific and creative.
    4.  **Determine Question Type:** For each question, decide if it should be 'single' choice (like choosing one style) or 'multiple' choice (like selecting multiple colors or features). Set the 'type' property accordingly.
    5.  **Output:** Respond ONLY with the raw JSON object matching the provided schema. Do not include markdown formatting (e.g., \`\`\`json), any introductory text, or any other conversational filler. The output must be a valid JSON object and nothing else.`;

    // 5. This is the main change. Your `genAI.models.generateContent` call is correct,
    //    but `generationConfig` and `systemInstruction` must be nested inside `config`.
    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [imagePart] }],
      config: {
        ...generationConfig,
        safetySettings,
        systemInstruction, // Pass the string here
      },
    });

    // 6. With the config passed correctly, the model *will* return only JSON.
    //    The string slicing is no longer needed and was the source of the error.
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    
    // 7. Parse the text directly.
    const jsonResponse = JSON.parse(responseText);

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Error in analyze API:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}