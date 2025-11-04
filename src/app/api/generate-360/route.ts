import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from '@google/genai';
import sharp from 'sharp';

const MODEL_NAME = "gemini-2.5-flash-image-preview";

async function imageToPart(buffer: Buffer, mimeType: string): Promise<Part> {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

export async function POST(req: NextRequest) {
  console.log("--- New /api/generate-360 request (v2 - outpainting) ---");
  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY as string });

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  try {
    const { redesignedImage } = await req.json();

    if (!redesignedImage) {
      return NextResponse.json({ error: 'Missing redesigned image' }, { status: 400 });
    }

    const match = redesignedImage.match(/^data:image\/(png|jpeg);base64,(.*)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid image data format (only png or jpeg supported)' }, { status: 400 });
    }
    const mimeType = `image/${match[1]}`;
    const base64Data = match[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // 1. Create a 2:1 canvas, resizing the input image if necessary
    const canvasWidth = 2048;
    const canvasHeight = 1024;
    
    const originalImage = sharp(imageBuffer);
    const metadata = await originalImage.metadata();
    
    // Resize the image to fit within the canvas while maintaining aspect ratio
    const resizedImageBuffer = await originalImage
      .resize({
        width: canvasWidth,
        height: canvasHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    const resizedMetadata = await sharp(resizedImageBuffer).metadata();
    const imageWidth = resizedMetadata.width!;
    const imageHeight = resizedMetadata.height!;

    const left = Math.floor((canvasWidth - imageWidth) / 2);
    const top = Math.floor((canvasHeight - imageHeight) / 2);

    const canvasBuffer = await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: resizedImageBuffer, left, top }])
    .png()
    .toBuffer();

    // 2. Create the mask
    const maskBuffer = await sharp({
        create: {
            width: canvasWidth,
            height: canvasHeight,
            channels: 3,
            background: { r: 255, g: 255, b: 255 } // White background
        }
    })
    .composite([{
        input: await sharp({ create: { width: imageWidth, height: imageHeight, channels: 3, background: { r: 0, g: 0, b: 0 } } }).png().toBuffer(),
        left,
        top
    }])
    .png()
    .toBuffer();

    // 3. Create the new prompt and image parts
    const systemInstruction = `You are an expert in digital image editing. Your task is to perform an "out-painting" operation.
- You will be given two images: a source image and a mask.
- Your goal is to fill in the white areas of the mask in the source image.
- The filled-in areas must realistically and seamlessly continue the scene from the existing content.
- The final output should be a single, complete, photorealistic image with no visible seams or artifacts.
- The output must be ONLY the image file.`;

    const canvasPart = await imageToPart(canvasBuffer, 'image/png');
    const maskPart = await imageToPart(maskBuffer, 'image/png');

    // 4. Call the API
    console.log("Calling Google GenAI API with outpainting technique...");
    const result = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: "user", parts: [
            { text: "Use the second image as a mask. Fill in the white areas of the mask in the first image, continuing the scene from the existing content to create a seamless 360-degree panorama." },
            canvasPart,
            maskPart
        ]}],
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
      console.error("API Error: Failed to parse image from API response for outpainting.");
      console.error("Full API Response for debugging:", JSON.stringify(result, null, 2));
      return NextResponse.json({ error: 'Failed to parse image from API response' }, { status: 500 });
    }

  } catch (error)
  {
    console.error("--- Unhandled Error in generate-360 API (v2) ---");
    console.error(error);
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}
