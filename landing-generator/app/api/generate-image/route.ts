import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
const API_KEY = process.env.AZURE_OPENAI_KEY!;
const DEPLOYMENT = process.env.AZURE_IMAGE_DEPLOYMENT!;
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const url = `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/images/generations?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY,
      },
      body: JSON.stringify({
        prompt,
        size: "1024x1024",
        n: 1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Azure Image API error:", response.status, err);
      return NextResponse.json(
        { error: `Azure Image API error: ${response.status} — ${err}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    // gpt-image models return b64_json directly, DALL-E returns url or b64_json
    const b64 = data.data?.[0]?.b64_json || data.data?.[0]?.b64;

    // If no base64, check for URL fallback
    const url_result = data.data?.[0]?.url;
    if (!b64 && !url_result) {
      console.error("Unexpected image response:", JSON.stringify(data).substring(0, 500));
      return NextResponse.json(
        { error: "No image data returned" },
        { status: 500 }
      );
    }

    if (b64) {
      return NextResponse.json({ image: `data:image/png;base64,${b64}` });
    }
    // URL fallback: fetch and convert to base64
    const imgRes = await fetch(url_result);
    const imgBuf = await imgRes.arrayBuffer();
    const imgB64 = Buffer.from(imgBuf).toString("base64");
    return NextResponse.json({ image: `data:image/png;base64,${imgB64}` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate image error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
