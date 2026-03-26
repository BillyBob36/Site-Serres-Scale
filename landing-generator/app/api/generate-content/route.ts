import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
const API_KEY = process.env.AZURE_OPENAI_KEY!;
const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT!;
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

export async function POST(req: NextRequest) {
  try {
    const { prompt, markdownContent, fieldType } = await req.json();

    const systemPrompt = `Tu es un expert en copywriting de landing pages B2B à haute conversion, spécialisé dans les services professionnels, le financement public (CEE, subventions, aides) et la génération de leads qualifiés.

RÈGLES STRICTES :
- Réponds UNIQUEMENT avec le contenu demandé, sans préambule, sans explication, sans guillemets englobants.
- Si on te demande du JSON, réponds avec du JSON valide uniquement.
- Adapte ton ton au secteur décrit dans le document source.
- Sois factuel, précis, et orienté conversion.
- N'invente pas de chiffres si le document n'en contient pas ; utilise alors des formulations prudentes ("jusqu'à", "selon configuration").
- Les textes doivent être prêts à intégrer directement dans un composant web.`;

    const userMessage = `DOCUMENT SOURCE (.md) :
---
${markdownContent}
---

CONSIGNE POUR CE CHAMP (type: ${fieldType}) :
${prompt}`;

    const url = `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Azure Chat API error:", response.status, errText);
      return NextResponse.json(
        { error: `Azure API error ${response.status}: ${errText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate content error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
