import { NextRequest, NextResponse } from "next/server";

const CODA_API = "https://coda.io/apis/v1";
const DOC_ID = "E5wySCD1or";
const STORES_TABLE_ID = "grid-KV62mskx4K";

// Column IDs from schema
const COLS = {
  name: "c-b2RaNTDwmf",
  country: "c-XQYSTzZgqQ",
  status: "c-khgS54aFd1",
  partnership: "c-k5tC0V8FNa",
  product: "c-YcHzyK1GFk",
  code: "c-hXwsJpYpes",
  rep: "c-uUjZtDXuu-",
  denom: "c--TZzOg-SfB",
  address: "c-YASiQLkfEw",
  city: "c-XJ0vPBES5j",
  notes: "c-d_tnYLBDm0",
  surface: "c-RUfypKSndE",
};

function getKey(): string | null {
  return process.env.CODA_API_KEY ?? null;
}

function codaHeaders(key: string) {
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

// GET /api/coda/sync — fetch all stores from Coda
export async function GET() {
  const key = getKey();
  if (!key) {
    return NextResponse.json({ error: "CODA_API_KEY non configurée. Ajoutez-la dans .env.local" }, { status: 401 });
  }

  try {
    const allRows: unknown[] = [];
    let pageToken: string | undefined;

    do {
      const url = new URL(`${CODA_API}/docs/${DOC_ID}/tables/${STORES_TABLE_ID}/rows`);
      url.searchParams.set("valueFormat", "simple");
      url.searchParams.set("limit", "100");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString(), { headers: codaHeaders(key) });
      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `Coda API error: ${res.status} — ${err}` }, { status: res.status });
      }
      const data = await res.json();
      allRows.push(...(data.items ?? []));
      pageToken = data.nextPageToken;
    } while (pageToken);

    // Normalize rows to our Store type
    const stores = allRows.map((row: unknown) => {
      const r = row as { id: string; values: Record<string, unknown> };
      const val = r.values ?? {};
      const rawStatus = String(val[COLS.status] ?? "");
      const STATUS_MAP: Record<string, string> = {
        "PROSPECT": "🎯 Prospects",
        "PROSPECTS": "🎯 Prospects",
      };
      const rawProduct = String(val[COLS.product] ?? "");
      const PRODUCT_MAP: Record<string, string> = {
        "Mixte": "MIXTE",
        "mixte": "MIXTE",
        "Centre commercial": "",
      };
      return {
        id: r.id,
        name: String(val[COLS.name] ?? ""),
        country: String(val[COLS.country] ?? ""),
        status: STATUS_MAP[rawStatus] ?? rawStatus,
        partnership: String(val[COLS.partnership] ?? ""),
        product: PRODUCT_MAP[rawProduct] ?? rawProduct,
        code: String(val[COLS.code] ?? ""),
        rep: String(val[COLS.rep] ?? ""),
        denom: String(val[COLS.denom] ?? ""),
        address: String(val[COLS.address] ?? ""),
        city: String(val[COLS.city] ?? ""),
        notes: String(val[COLS.notes] ?? ""),
        surface: val[COLS.surface] != null ? String(val[COLS.surface]) : "",
      };
    });

    return NextResponse.json({ stores, count: stores.length, syncedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/coda/sync — add a new store row to Coda
export async function POST(req: NextRequest) {
  const key = getKey();
  if (!key) {
    return NextResponse.json({ error: "CODA_API_KEY non configurée" }, { status: 401 });
  }

  const body = await req.json();
  const { name, country, status, partnership, product, code, rep, denom, address, city, notes, surface } = body;

  if (!name || !country) {
    return NextResponse.json({ error: "name et country sont requis" }, { status: 400 });
  }

  const cells = [
    { column: COLS.name, value: name },
    { column: COLS.country, value: country },
    { column: COLS.status, value: status ?? "🔍 En recherche cellule" },
    { column: COLS.partnership, value: partnership ?? "" },
    { column: COLS.product, value: product ?? "" },
    { column: COLS.code, value: code ?? "" },
    { column: COLS.rep, value: rep ?? "" },
    { column: COLS.denom, value: denom ?? "" },
    { column: COLS.address, value: address ?? "" },
    { column: COLS.city, value: city ?? "" },
    { column: COLS.notes, value: notes ?? "" },
    { column: COLS.surface, value: surface ? parseFloat(surface) : null },
  ].filter((c) => c.value !== "" && c.value !== null);

  try {
    const res = await fetch(`${CODA_API}/docs/${DOC_ID}/tables/${STORES_TABLE_ID}/rows`, {
      method: "POST",
      headers: codaHeaders(key),
      body: JSON.stringify({ rows: [{ cells }] }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Coda API error: ${res.status} — ${err}` }, { status: res.status });
    }

    const data = await res.json();
    const codaRowId = data.addedRowIds?.[0] ?? null;
    return NextResponse.json({ ok: true, codaRowId, addedRows: data.addedRowIds?.length ?? 1 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/coda/sync?rowId=xxx — delete a store row from Coda
export async function DELETE(req: NextRequest) {
  const key = getKey();
  if (!key) return NextResponse.json({ error: "CODA_API_KEY non configurée" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rowId = searchParams.get("rowId");
  if (!rowId) return NextResponse.json({ error: "rowId requis" }, { status: 400 });

  try {
    const res = await fetch(`${CODA_API}/docs/${DOC_ID}/tables/${STORES_TABLE_ID}/rows/${rowId}`, {
      method: "DELETE",
      headers: codaHeaders(key),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Coda error: ${res.status} — ${err}` }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PATCH /api/coda/sync — update an existing store row in Coda
export async function PATCH(req: NextRequest) {
  const key = getKey();
  if (!key) return NextResponse.json({ error: "CODA_API_KEY non configurée" }, { status: 401 });

  const body = await req.json();
  const { codaRowId, ...fields } = body;
  if (!codaRowId) return NextResponse.json({ error: "codaRowId requis" }, { status: 400 });

  const colMap: Record<string, string> = {
    name: COLS.name, country: COLS.country, status: COLS.status,
    partnership: COLS.partnership, product: COLS.product, code: COLS.code,
    rep: COLS.rep, denom: COLS.denom, address: COLS.address,
    city: COLS.city, notes: COLS.notes, surface: COLS.surface,
  };

  const cells = Object.entries(fields)
    .filter(([k, v]) => colMap[k] && v !== undefined && v !== null)
    .map(([k, v]) => ({ column: colMap[k], value: k === "surface" && v ? parseFloat(String(v)) : v }));

  try {
    const res = await fetch(`${CODA_API}/docs/${DOC_ID}/tables/${STORES_TABLE_ID}/rows/${codaRowId}`, {
      method: "PUT",
      headers: codaHeaders(key),
      body: JSON.stringify({ row: { cells } }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Coda error: ${res.status} — ${err}` }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
