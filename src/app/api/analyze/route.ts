import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from '@google/genai';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'analysis');
const MODEL_NAME = "gemini-2.5-flash";

// Ensure the cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create cache directory:', error);
  }
}
ensureCacheDir();

export async function POST(req: NextRequest) {
  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY as string });

  const responseSchema = {
    type: "OBJECT",
    properties: {
      designerNotes: { type: "STRING", description: "A brief, friendly analysis of the room's style, layout, and key features (e.g., lighting, focal points)." },
      questions: {
        type: "ARRAY",
        description: "A list of at least 5 questions to help the user customize their design.",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING", description: "The question for the user (e.g., 'What style are you drawn to?')." },
            options: { type: "ARRAY", description: "A list of 3-5 concise, one-or-two-word options for the user to choose from.", items: { type: "STRING" } },
            type: { type: "STRING", description: "The type of question: 'single' for radio buttons (only one answer) or 'multiple' for checkboxes (multiple answers allowed).", enum: ["single", "multiple"] },
            coordinates: {
              type: "OBJECT",
              description: "The x and y coordinates (as percentages from 0 to 100) for placing a hotspot on the image, corresponding to the most relevant area for this question.",
              properties: {
                x: { type: "NUMBER", description: "The percentage from the left edge of the image (0-100)." },
                y: { type: "NUMBER", description: "The percentage from the top edge of the image (0-100)." }
              },
              required: ["x", "y"]
            }
          },
          required: ["question", "options", "type", "coordinates"],
        },
      },
    },
    required: ["designerNotes", "questions"],
  };

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
    const { image: imageData, bypassCache, existingQuestions } = await req.json();
    if (!imageData) {
      return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
    }

    const hash = crypto.createHash('sha256').update(imageData).digest('hex');
    const cacheFilePath = path.join(CACHE_DIR, `${hash}.json`);

    if (!bypassCache) {
      try {
        const cachedData = await fs.readFile(cacheFilePath, 'utf-8');
        console.log('Returning cached analysis.');
        return NextResponse.json(JSON.parse(cachedData));
      } catch (error) {
        // Not in cache, proceed
      }
    }

    const match = imageData.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid image data format' }, { status: 400 });
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const imagePart: Part = {
      inlineData: { data: base64Data, mimeType },
    };

    const systemInstruction: string = `You are a world-class interior designer AI. Your task is to analyze the user's room image and generate a set of questions to help them redesign it.
    ${existingQuestions && existingQuestions.length > 0 ? `Do not generate questions that are already in this list: ${existingQuestions.join(", ")}.` : ''}
    1.  **Analyze the image:** Briefly describe the room's current state in your "Designer's Notes".
    2.  **Identify Objects & Areas:** Identify specific objects or areas in the room. This must include the ceiling, the door, and all visible walls, in addition to other features like furniture, windows, and flooring.
    3.  **Generate Contextual Questions:** Create a minimum of 5 multiple-choice questions about design preferences. Each question MUST be directly related to a specific object or area you identified.
    4.  **Assign Coordinates:** For EACH question, provide the x and y coordinates (as percentages from 0 to 100) for a hotspot. The hotspot should be placed on the object or area the question is about. For example, a question about flooring should have coordinates pointing to the floor. A question about a specific chair should have coordinates on that chair.
    5.  **Determine Question Type:** For each question, decide if it should be 'single' choice (like choosing one style) or 'multiple' choice (like selecting multiple colors or features). Set the 'type' property accordingly.
    6.  **Output:** Respond ONLY with the raw JSON object matching the provided schema. Do not include markdown formatting (e.g., \`\`\`json), any introductory text, or any other conversational filler. The output must be a valid JSON object and nothing else.`;

    console.log(`Generating analysis for image hash: ${hash}`);

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [imagePart] }],
      config: {
        ...generationConfig,
        safetySettings,
        systemInstruction,
      },
    });

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      return NextResponse.json({ error: 'Internal server error from AI' }, { status: 500 });
    }
    
    const jsonResponse = JSON.parse(responseText);

    try {
      await fs.writeFile(cacheFilePath, JSON.stringify(jsonResponse, null, 2), 'utf-8');
      console.log('Saved new analysis to cache.');
    } catch (error) {
      console.error('Failed to write to cache:', error);
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Error in analyze API:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}