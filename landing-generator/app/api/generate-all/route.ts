import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
const API_KEY = process.env.AZURE_OPENAI_KEY!;
const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT!;
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

interface FieldRequest {
  fieldId: string;
  prompt: string;
  fieldType: string;
}

export async function POST(req: NextRequest) {
  try {
    const { fields, markdownContent } = (await req.json()) as {
      fields: FieldRequest[];
      markdownContent: string;
    };

    const systemPrompt = `Tu es un expert en copywriting de landing pages B2B à haute conversion, spécialisé dans les services professionnels, le financement public (CEE, subventions, aides) et la génération de leads qualifiés.

RÈGLES STRICTES :
- Réponds UNIQUEMENT en JSON valide : un objet dont les clés sont les fieldId fournis, et les valeurs sont les contenus générés.
- Pour chaque champ, suis exactement la consigne donnée.
- Si le type est "cards", la valeur doit être un JSON array stringifié.
- Si le type est "list", la valeur doit être les items séparés par \\n.
- Si le type est "image", la valeur doit être un prompt de génération d'image détaillé.
- Pour tous les autres types, la valeur est une string simple.
- N'invente pas de chiffres si le document n'en contient pas.
- Les textes doivent être prêts à intégrer directement.`;

    const fieldsDescription = fields
      .map(
        (f) =>
          `- fieldId: "${f.fieldId}" (type: ${f.fieldType})\n  Consigne: ${f.prompt}`
      )
      .join("\n\n");

    const userMessage = `DOCUMENT SOURCE (.md) :
---
${markdownContent}
---

CHAMPS À GÉNÉRER :
${fieldsDescription}

Réponds avec un seul objet JSON contenant tous les fieldId comme clés.`;

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
        max_completion_tokens: 8192,
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
    const raw = data.choices?.[0]?.message?.content || "{}";

    // Parse JSON robustement (le modèle peut wrapper dans ```json)
    let parsed: Record<string, string> = {};
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse batch response:", raw);
      return NextResponse.json(
        { error: "Failed to parse AI response", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({ results: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate all error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
