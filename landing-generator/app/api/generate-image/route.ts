import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
    const apiKey = process.env.AZURE_OPENAI_KEY!;
    const deployment = process.env.AZURE_IMAGE_DEPLOYMENT!;

    const url = `${endpoint}/openai/deployments/${deployment}/images/generations?api-version=2024-02-01`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        size: "1024x1024",
        quality: "medium",
        output_compression: 80,
        output_format: "png",
        n: 1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Azure Image API error:", err);
      return NextResponse.json(
        { error: `Azure Image API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;

    if (!b64) {
      return NextResponse.json(
        { error: "No image data returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate image error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
