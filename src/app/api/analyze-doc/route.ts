import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/generative-ai";
import { HEALTH_ANALYTICS_PROMPT } from "@/constants/prompts";

// Initialize Gemini API Client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini API key is missing in environmental variables.",
        },
        { status: 500 },
      );
    }

    const { textData, fileBase64, mimeType } = await request.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let aiResponse;

    if (fileBase64 && mimeType) {
      // Handle Image/PDF Upload via Base64
      const imagePart = {
        inlineData: {
          data: fileBase64.split(",")[1], // Extract actual base64 content
          mimeType: mimeType,
        },
      };

      const result = await model.generateContent([
        HEALTH_ANALYTICS_PROMPT,
        imagePart,
      ]);
      aiResponse = result.response.text();
    } else if (textData) {
      // Handle Raw Text Input
      const result = await model.generateContent([
        HEALTH_ANALYTICS_PROMPT,
        `Prescription Data to analyze:\n${textData}`,
      ]);
      aiResponse = result.response.text();
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No prescription text or image data provided.",
        },
        { status: 400 },
      );
    }

    // Clean any unexpected formatting if AI forgets rules
    const cleanJsonString = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedMedicalData = JSON.parse(cleanJsonString);

    return NextResponse.json({ success: true, data: parsedMedicalData });
  } catch (error: any) {
    console.error("AI Middleware Parsing Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process document via AI",
      },
      { status: 500 },
    );
  }
}
