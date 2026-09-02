import { NextResponse } from "next/server";

const DOC_ID = "E5wySCD1or";
const TODOS_TABLE_ID = "grid-trDCuM8KMG";
const BASE = "https://coda.io/apis/v1";

const COLS = {
  title:    "c-XLz-oUjKNJ", // Task
  done:     "c-0sIclGYn9A", // Done (boolean)
  priority: "c-iYi8v0C_Q7", // Priorité (P1/P2/P3)
};

const PRIORITY_MAP: Record<string, string> = {
  "P1": "haute",
  "P2": "moyenne",
  "P3": "basse",
};
const PRIORITY_TO_CODA: Record<string, string> = {
  "haute":   "P1",
  "moyenne": "P2",
  "basse":   "P3",
};

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.CODA_API_KEY}`,
    "Content-Type": "application/json",
  };
}

// GET — fetch all todos from Coda
export async function GET() {
  const apiKey = process.env.CODA_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "CODA_API_KEY not configured" }, { status: 401 });

  try {
    const todos: unknown[] = [];
    let pageToken: string | null = null;

    do {
      const url: string = `${BASE}/docs/${DOC_ID}/tables/${TODOS_TABLE_ID}/rows?valueFormat=simple&limit=100${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const res: Response = await fetch(url, { headers: getHeaders() });
      if (!res.ok) {
        const t = await res.text();
        return NextResponse.json({ error: `Coda error: ${res.status} — ${t}` }, { status: res.status });
      }
      const data: { items?: { id: string; name: string; createdAt: string; updatedAt: string; values: Record<string, unknown> }[]; nextPageToken?: string } = await res.json();
      for (const row of data.items ?? []) {
        const v = row.values ?? {};
        const done = v[COLS.done] === true;
        const rawPriority = String(v[COLS.priority] ?? "");
        todos.push({
          id: row.id,
          title: String(v[COLS.title] ?? row.name ?? ""),
          status: done ? "terminé" : "à_faire",
          priority: PRIORITY_MAP[rawPriority] ?? "moyenne",
          assignee: "",
          category: "",
          codaRowId: row.id,
          createdAt: row.createdAt?.split("T")[0] ?? new Date().toISOString().split("T")[0],
          updatedAt: row.updatedAt?.split("T")[0] ?? new Date().toISOString().split("T")[0],
        });
      }
      pageToken = data.nextPageToken ?? null;
    } while (pageToken);

    return NextResponse.json({ todos, syncedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST — add a new todo
export async function POST(req: Request) {
  const apiKey = process.env.CODA_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "CODA_API_KEY not configured" }, { status: 401 });

  try {
    const body = await req.json();
    const cells = [
      { column: COLS.title,    value: body.title ?? "" },
      { column: COLS.done,     value: false },
      { column: COLS.priority, value: PRIORITY_TO_CODA[body.priority ?? "moyenne"] ?? "P2" },
    ];

    const res = await fetch(`${BASE}/docs/${DOC_ID}/tables/${TODOS_TABLE_ID}/rows`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ rows: [{ cells }] }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `Coda error: ${res.status} — ${t}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({ ok: true, codaRowId: data.addedRowIds?.[0] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH — toggle done or update title
export async function PATCH(req: Request) {
  const apiKey = process.env.CODA_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "CODA_API_KEY not configured" }, { status: 401 });

  try {
    const { codaRowId, status, title, priority } = await req.json();
    if (!codaRowId) return NextResponse.json({ error: "codaRowId required" }, { status: 400 });

    const cells: { column: string; value: unknown }[] = [];
    if (status !== undefined) cells.push({ column: COLS.done, value: status === "terminé" });
    if (title)    cells.push({ column: COLS.title,    value: title });
    if (priority) cells.push({ column: COLS.priority, value: PRIORITY_TO_CODA[priority] ?? "P2" });

    const res = await fetch(`${BASE}/docs/${DOC_ID}/tables/${TODOS_TABLE_ID}/rows/${codaRowId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ row: { cells } }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `Coda error: ${res.status} — ${t}` }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE — remove a todo
export async function DELETE(req: Request) {
  const apiKey = process.env.CODA_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "CODA_API_KEY not configured" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const codaRowId = searchParams.get("codaRowId");
  if (!codaRowId) return NextResponse.json({ error: "codaRowId required" }, { status: 400 });

  try {
    const res = await fetch(`${BASE}/docs/${DOC_ID}/tables/${TODOS_TABLE_ID}/rows/${codaRowId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `Coda error: ${res.status} — ${t}` }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
