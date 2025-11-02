import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from '@google/genai';

const MODEL_NAME = "gemini-2.5-flash-image-preview";

export async function POST(req: NextRequest) {
  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY as string });

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  try {
    const { originalImage, designerNotes, userAnswers } = await req.json();

    if (!originalImage || !designerNotes || !userAnswers) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const answersString = Object.entries(userAnswers)
      .map(([question, answer]) => `- ${question}: ${answer}`)
      .join('\n');

    const systemInstruction = `**Objective:** Redesign the following room based on the user's preferences.

**CRITICAL INSTRUCTION: You MUST preserve the original room's structure.**
-   **KEEP:** The walls, windows, doors, ceiling, and overall layout MUST remain exactly the same. Do not add, remove, or move these structural elements.
-   **CHANGE:** You should only change the "soft" elements like furniture, color palette, decorations, lighting fixtures, and floor materials.

Based on these instructions, generate a new, photorealistic image of the redesigned room. The output should be only the image.`;

    const userPrompt = `
      **Original Designer's Analysis:**
      ${designerNotes}

      **User's Design Preferences:**
      ${answersString}
    `;

    console.log("--- Generation Prompt ---");
    console.log("System Instruction:", systemInstruction);
    console.log("User Prompt:", userPrompt);
    console.log("-------------------------");

    const match = originalImage.match(/^data:(image\/\w+);base64,(.*)$/);
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

    const result = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: "user", parts: [{text: userPrompt}, imagePart] }],
        config: {
            safetySettings,
            systemInstruction,
        }
    });
    
    const imageResponsePart = result.candidates?.[0]?.content?.parts?.[0];

    if (imageResponsePart && imageResponsePart.inlineData) {
      const generatedImage = {
        mimeType: imageResponsePart.inlineData.mimeType,
        data: imageResponsePart.inlineData.data,
      };
      const imageBase64 = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
      return NextResponse.json({ image: imageBase64 });
    } else {
      console.error("Unexpected API response structure:", JSON.stringify(result, null, 2));
      return NextResponse.json({ error: 'Failed to parse image from API response' }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}