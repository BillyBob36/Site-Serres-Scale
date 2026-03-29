import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
const API_KEY = process.env.AZURE_OPENAI_KEY!;
const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT!;
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl } = await req.json();

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image")) {
      return NextResponse.json({ error: "Image data URL required" }, { status: 400 });
    }

    const url = `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `Tu es un expert en direction artistique et en prompt engineering pour la génération d'images par IA.
Quand on te montre une image, tu décris UNIQUEMENT son style visuel, PAS son sujet ni son contenu.
Exemples de descriptions de style :
- "Photographie professionnelle, éclairage studio doux, arrière-plan flouté, tons chauds, profondeur de champ faible"
- "Illustration vectorielle flat design, couleurs vives, contours nets, sans ombre portée"
- "Dessin technique au crayon, noir et blanc, traits fins, hachures pour les ombres, perspective isométrique"

Réponds UNIQUEMENT avec la description du style, sans préambule ni explication. 2-3 phrases maximum.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Décris le style visuel de cette image (technique, éclairage, couleurs, rendu, texture) sans décrire son sujet.",
              },
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
            ],
          },
        ],
        max_completion_tokens: 512,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Azure style API error:", response.status, err);
      return NextResponse.json(
        { error: `Azure API error ${response.status}: ${err}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const style = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ style });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate style error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
