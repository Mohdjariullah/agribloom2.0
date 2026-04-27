/**
 * data.gov.in AGMARKNET wrapper.
 * Resource: "Current Daily Price of Various Commodities from Various Markets (Mandi)"
 * Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 */

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

export type AgmarknetRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety?: string;
  grade?: string;
  arrival_date: string; // dd/mm/yyyy
  min_price?: string;
  max_price?: string;
  modal_price?: string;
};

export type AgmarknetResponse = {
  records: AgmarknetRecord[];
  total?: number;
  count?: number;
  message?: string;
};

export type FetchPricesArgs = {
  commodity?: string;
  state?: string;
  district?: string;
  market?: string;
  limit?: number;
};

export async function fetchAgmarknetPrices(args: FetchPricesArgs): Promise<AgmarknetRecord[]> {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) {
    throw new Error("DATA_GOV_API_KEY is not set. Add it to .env.local.");
  }

  const params = new URLSearchParams({
    "api-key": apiKey,
    format: "json",
    limit: String(args.limit ?? 100),
  });
  if (args.state) params.append("filters[state]", args.state);
  if (args.district) params.append("filters[district]", args.district);
  if (args.commodity) params.append("filters[commodity]", args.commodity);
  if (args.market) params.append("filters[market]", args.market);

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`AGMARKNET API ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const data: AgmarknetResponse = await res.json();
  return data.records ?? [];
}

/** Parses dd/mm/yyyy → Date (UTC midnight). Returns null on failure. */
export function parseArrivalDate(raw: string): Date | null {
  if (!raw) return null;
  // Some records use "dd/mm/yyyy", others "yyyy-mm-dd"
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  return isNaN(d.getTime()) ? null : d;
}

export function toNumberOrUndefined(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
