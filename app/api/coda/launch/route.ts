import { NextResponse } from "next/server";

const DOC_ID = "E5wySCD1or";
const BASE = "https://coda.io/apis/v1";

const COL_DONE  = "c-2Dcr4ktUr3";
const COL_TITLE = "c-H8fpQB0Sh7";
const COL_DUE   = "c-p2hqxfq9K6";
const COL_NOTES = "c-NgBbdPT8oE";

const CHECKLIST_TABLES = [
  { id: "grid-NhBeWFFq5a", label: "Juridique",  colDone: COL_DONE, colTitle: COL_TITLE, colDue: COL_DUE, colNotes: COL_NOTES },
  { id: "grid-FUXbBjWp0S", label: "Travaux",    colDone: COL_DONE, colTitle: COL_TITLE, colDue: COL_DUE, colNotes: COL_NOTES },
  { id: "grid-aJ8x8SRAjR", label: "Marketing",  colDone: COL_DONE, colTitle: COL_TITLE, colDue: COL_DUE, colNotes: COL_NOTES },
];

function getHeaders() {
  return { Authorization: `Bearer ${process.env.CODA_API_KEY}` };
}

async function fetchTableRows(tableId: string, colTitle: string, colDone: string, colDue: string, colNotes: string) {
  const url = `${BASE}/docs/${DOC_ID}/tables/${tableId}/rows?valueFormat=simple&limit=100`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map((row: { id: string; values: Record<string, unknown> }) => ({
    id: row.id,
    title: String(row.values[colTitle] ?? ""),
    done: row.values[colDone] === true,
    dueDate: String(row.values[colDue] ?? ""),
    notes: String(row.values[colNotes] ?? ""),
  }));
}

export async function GET() {
  if (!process.env.CODA_API_KEY) return NextResponse.json({ error: "CODA_API_KEY missing" }, { status: 401 });

  try {
    const checklists = await Promise.all(
      CHECKLIST_TABLES.map(async (t) => ({
        label: t.label,
        tableId: t.id,
        colDone: t.colDone,
        tasks: await fetchTableRows(t.id, t.colTitle, t.colDone, t.colDue, t.colNotes),
      }))
    );

    return NextResponse.json({ checklists });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!process.env.CODA_API_KEY) return NextResponse.json({ error: "CODA_API_KEY missing" }, { status: 401 });

  const { tableId, rowId, colDone, done } = await req.json();
  if (!tableId || !rowId || !colDone) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const res = await fetch(`${BASE}/docs/${DOC_ID}/tables/${tableId}/rows/${rowId}`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ row: { cells: [{ column: colDone, value: done }] } }),
  });
  if (!res.ok) return NextResponse.json({ error: `Coda error ${res.status}` }, { status: res.status });
  return NextResponse.json({ ok: true });
}
