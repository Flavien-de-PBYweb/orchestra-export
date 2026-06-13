import { NextResponse } from "next/server";

const DOC_ID = "E5wySCD1or";
const TODOS_TABLE_ID = "grid-rKecpQ5cV6";
const BASE = "https://coda.io/apis/v1";

// Column IDs in the "📅 Planning GANTT — Toutes tâches" table
const COLS = {
  title:    "c-p8rAlKo9JQ", // Tâche
  category: "c-VAf-I-qteP", // Catégorie
  team:     "c-a2W7YI_tqF", // Team
  status:   "c-19BwWlhWWo", // Statut
  duration: "c-HMYn9ejTE-", // Durée (j)
  owner:    "c-UTEfCNCHsA", // Owner
  notes:    "c-A6-MyQlTo1", // Commentaire
};

// Map our app statuses ↔ Coda statuses
const STATUS_TO_CODA: Record<string, string> = {
  "à_faire":  "Not started",
  "en_cours": "In progress",
  "terminé":  "Done",
  "bloqué":   "Blocked",
};
const STATUS_FROM_CODA: Record<string, string> = {
  "Not started": "à_faire",
  "In progress": "en_cours",
  "Done":        "terminé",
  "Blocked":     "bloqué",
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
  if (!apiKey) {
    return NextResponse.json({ error: "CODA_API_KEY not configured" }, { status: 401 });
  }

  try {
    const todos: unknown[] = [];
    let pageToken: string | null = null;

    do {
      const url: string = `${BASE}/docs/${DOC_ID}/tables/${TODOS_TABLE_ID}/rows?limit=100${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const res: Response = await fetch(url, { headers: getHeaders() });
      if (!res.ok) {
        const t = await res.text();
        return NextResponse.json({ error: `Coda error: ${res.status} — ${t}` }, { status: res.status });
      }
      const data: { items?: { id: string; name: string; createdAt: string; updatedAt: string; values: Record<string, string> }[]; nextPageToken?: string } = await res.json();
      for (const row of data.items ?? []) {
        const v = row.values ?? {};
        todos.push({
          id: row.id,
          title: v[COLS.title] ?? row.name ?? "",
          status: STATUS_FROM_CODA[v[COLS.status]] ?? "à_faire",
          assignee: v[COLS.owner] ?? "",
          priority: "normale",
          category: v[COLS.category] ?? "",
          notes: v[COLS.notes] ?? "",
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

// POST — add a new todo to Coda
export async function POST(req: Request) {
  const apiKey = process.env.CODA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "CODA_API_KEY not configured" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const cells = [
      { column: COLS.title,    value: body.title ?? "" },
      { column: COLS.status,   value: STATUS_TO_CODA[body.status ?? "à_faire"] ?? "Not started" },
      { column: COLS.category, value: body.category ?? "" },
      { column: COLS.notes,    value: body.notes ?? "" },
    ];
    if (body.assignee) cells.push({ column: COLS.owner, value: body.assignee });

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

// PATCH — update a todo status in Coda
export async function PATCH(req: Request) {
  const apiKey = process.env.CODA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "CODA_API_KEY not configured" }, { status: 401 });
  }

  try {
    const { codaRowId, status, title, notes } = await req.json();
    if (!codaRowId) return NextResponse.json({ error: "codaRowId required" }, { status: 400 });

    const cells: { column: string; value: string }[] = [];
    if (status) cells.push({ column: COLS.status, value: STATUS_TO_CODA[status] ?? "Not started" });
    if (title)  cells.push({ column: COLS.title,  value: title });
    if (notes)  cells.push({ column: COLS.notes,  value: notes });

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
