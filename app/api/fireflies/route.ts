import { NextResponse } from "next/server";

const FIREFLIES_API = "https://api.fireflies.ai/graphql";

const TRANSCRIPTS_QUERY = `
  query {
    transcripts(limit: 20) {
      id
      title
      date
      duration
      summary {
        overview
        action_items
      }
      sentences {
        speaker_name
        text
      }
      participants
    }
  }
`;

export async function GET() {
  const apiKey = process.env.FIREFLIES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FIREFLIES_API_KEY not configured" }, { status: 401 });
  }

  try {
    const res = await fetch(FIREFLIES_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: TRANSCRIPTS_QUERY }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Fireflies API error: ${res.status} — ${text}` }, { status: res.status });
    }

    const json = await res.json();

    if (json.errors) {
      return NextResponse.json({ error: json.errors[0]?.message ?? "GraphQL error" }, { status: 400 });
    }

    const transcripts = (json.data?.transcripts ?? []).map((t: {
      id: string;
      title: string;
      date: string;
      duration: number;
      participants: string[];
      summary?: { overview?: string; action_items?: string[] | string };
      sentences?: { speaker_name: string; text: string }[];
    }) => ({
      id: t.id,
      title: t.title,
      date: t.date,
      duration: Math.round((t.duration ?? 0) / 60),
      participants: t.participants ?? [],
      summary: t.summary?.overview ?? null,
      actionItems: Array.isArray(t.summary?.action_items)
        ? t.summary.action_items
        : typeof t.summary?.action_items === "string"
          ? t.summary.action_items.split("\n").map((l: string) => l.replace(/^\*\*.*?\*\*\s*/, "").replace(/^\s*[-•]\s*/, "").trim()).filter(Boolean)
          : [],
      transcript: t.sentences
        ?.map((s: { speaker_name: string; text: string }) => `${s.speaker_name}: ${s.text}`)
        .join("\n") ?? null,
    }));

    return NextResponse.json({ transcripts });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
