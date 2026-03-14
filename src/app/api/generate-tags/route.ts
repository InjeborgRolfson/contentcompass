import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { title, creator, type, note } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`, 
        "X-Title": "ContentCompass",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          {
            "role": "user",
            "content": `Generate 4-5 thematic tags (comma separated) for the following content:
              Title: ${title}
              Creator: ${creator}
              Type: ${type}
              Personal Note: ${note}
              
              Return ONLY the tags as a comma-separated list, no other text.`
          }
        ],
      })
    });

    const data = await response.json();
    const tagsText = data.choices[0].message.content;

    const tags = tagsText.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('OpenRouter error:', error);
    return NextResponse.json({ tags: [] });
  }
}
