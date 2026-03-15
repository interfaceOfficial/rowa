import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { name, slogan, style, colors, symbol, mood } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Startup-Name fehlt' }, { status: 400 });
    }

    // ── Schritt 1: Gemini erstellt einen präzisen Imagen-Prompt ──
    const promptResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are a professional logo designer. Create a concise, detailed image generation prompt for a company logo.

Company details:
- Name: ${name}
- Slogan: ${slogan || 'none'}
- Style: ${style}
- Color palette: ${colors}
- Symbol type: ${symbol}
- Brand mood: ${mood}

Rules:
- Return ONLY the image generation prompt, nothing else
- Max 150 words
- Describe: composition, colors, shapes, typography style, background
- Start with "A professional logo for ${name},"
- Make it suitable for Imagen 3 image generation
- Include "white background, isolated, vector style"`,
    });

    const logoPrompt = promptResponse.text ?? '';

    // ── Schritt 2: Imagen 3 generiert das Logo ──
    const imageResponse = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: logoPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    const imageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;

    if (!imageBytes) {
      return NextResponse.json({ error: 'Logo konnte nicht generiert werden' }, { status: 500 });
    }

    return NextResponse.json({ image: imageBytes, prompt: logoPrompt });

  } catch (err) {
    console.error('Logo generation error:', err);
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
