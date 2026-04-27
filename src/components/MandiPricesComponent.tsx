"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

interface PriceData {
  market: string;
  district: string;
  state: string;
  min: number;
  max: number;
  modal: number;
  date: string;
}

interface MandiResponse {
  prices: PriceData[];
  commodity: string;
  state: string;
  district: string;
  message: string;
  source: "live" | "cache";
}

interface TrendPoint {
  date: string;
  avgModal: number;
  avgMin: number;
  avgMax: number;
  samples: number;
}

export default function MandiPricesComponent() {
  const { selectedLanguage, translateText } = useLanguage();
  const { t } = useTranslation();

  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const [selectedCommodity, setSelectedCommodity] = useState("Tomato");
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("all-districts");
  const [responseData, setResponseData] = useState<MandiResponse | null>(null);
  const [translatedAdvice, setTranslatedAdvice] = useState("");

  const [commodities, setCommodities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtsByState, setDistrictsByState] = useState<{ [key: string]: string[] }>({});
  const [loadingData, setLoadingData] = useState(true);

  // Initial dropdown population (from existing CSV-backed list endpoint)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandis-list")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (cancelled) return;
        setCommodities(data.commodities ?? []);
        setStates(data.states ?? []);
        setDistrictsByState(data.districtsByState ?? {});
        if ((data.states ?? []).length) setSelectedState(data.states[0]);
        const tomato = (data.commodities ?? []).find((c: string) => c.toLowerCase().includes("tomato"));
        if (tomato) setSelectedCommodity(tomato);
      })
      .catch((err) => console.warn("mandis-list load failed:", err))
      .finally(() => !cancelled && setLoadingData(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset district when state changes
  useEffect(() => {
    if (selectedState && districtsByState[selectedState]) {
      setDistricts(districtsByState[selectedState]);
    } else {
      setDistricts([]);
    }
    setSelectedDistrict("all-districts");
  }, [selectedState, districtsByState]);

  const fetchPrices = async () => {
    setLoading(true);
    setTrend([]);

    try {
      const res = await fetch("/api/mandi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity: selectedCommodity,
          state: selectedState,
          district: selectedDistrict === "all-districts" ? undefined : selectedDistrict,
        }),
      });

      if (!res.ok) throw new Error(`status ${res.status}`);
      const data: MandiResponse = await res.json();
      setPrices(data.prices ?? []);
      setResponseData(data);

      if ((data.prices ?? []).length > 0) {
        const advice = generateFarmerAdvice(data.prices, data.commodity);
        const translated = await translateText(advice);
        setTranslatedAdvice(translated);
      } else {
        setTranslatedAdvice("");
      }

      // Fire trend fetch in parallel
      setTrendLoading(true);
      fetch(
        `/api/mandi/trend?commodity=${encodeURIComponent(selectedCommodity)}&state=${encodeURIComponent(selectedState)}&days=7`
      )
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => setTrend(d.points ?? []))
        .catch(() => setTrend([]))
        .finally(() => setTrendLoading(false));
    } catch (err) {
      console.error("Mandi fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateFarmerAdvice = (priceData: PriceData[], commodity: string): string => {
    if (priceData.length === 0) return "No price data available.";
    const sorted = [...priceData].sort((a, b) => a.modal - b.modal);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    if (!low.modal || !high.modal) return `Showing ${priceData.length} markets for ${commodity}.`;
    const diffPct = ((high.modal - low.modal) / low.modal) * 100;
    if (diffPct > 20) {
      return `💰 Big spread: ${commodity} ranges from ₹${low.modal} at ${low.market} to ₹${high.modal} at ${high.market}. Selling at ${high.market} could lift income by ~${Math.round(diffPct)}%.`;
    }
    if (diffPct > 10) {
      return `📊 Moderate spread for ${commodity}: best price at ${high.market} (₹${high.modal}).`;
    }
    return `✅ Prices for ${commodity} are stable across markets — about ₹${Math.round((low.modal + high.modal) / 2)}.`;
  };

  const minTrend = useMemo(() => {
    if (!trend.length) return null;
    return Math.min(...trend.map((p) => p.avgMin || p.avgModal || Infinity));
  }, [trend]);
  const maxTrend = useMemo(() => {
    if (!trend.length) return null;
    return Math.max(...trend.map((p) => p.avgMax || p.avgModal || 0));
  }, [trend]);

  return (
    <div className="p-4 sm:p-6 border rounded-2xl shadow-lg bg-white">
      {/* Controls */}
      {loadingData ? (
        <div className="text-center py-8 text-gray-600">{t("mandi.loadingData")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div>
            <Label htmlFor="commodity-select" className="text-sm font-medium mb-1">
              {t("mandi.commodity")}
            </Label>
            <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
              <SelectTrigger id="commodity-select" className="w-full">
                <SelectValue placeholder={t("mandi.commodity")} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {commodities.map((c, i) => (
                  <SelectItem key={`commodity-${i}-${c}`} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="state-select" className="text-sm font-medium mb-1">
              {t("mandi.state")}
            </Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger id="state-select" className="w-full">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {states.map((s, i) => (
                  <SelectItem key={`state-${i}-${s}`} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="district-select" className="text-sm font-medium mb-1">
              {t("mandi.district")}
            </Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger id="district-select" className="w-full">
                <SelectValue placeholder={t("mandi.allDistricts")} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all-districts">{t("mandi.allDistricts")}</SelectItem>
                {districts.map((d, i) => (
                  <SelectItem key={`district-${i}-${d}`} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchPrices}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              {loading ? t("mandi.fetching") : t("mandi.getPrices")}
            </button>
          </div>
        </div>
      )}

      {/* Trend chart */}
      {trend.length > 0 && (
        <div className="mb-6 p-3 sm:p-4 rounded-xl bg-green-50/60 border border-green-100">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <h3 className="font-semibold text-green-800 text-sm sm:text-base">
              📈 {selectedCommodity} — last {trend.length} day{trend.length === 1 ? "" : "s"}
            </h3>
            <span className="text-xs text-gray-500">
              {minTrend != null && maxTrend != null
                ? `range ₹${minTrend} – ₹${maxTrend}`
                : null}
            </span>
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 12, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" />
                <XAxis dataKey="date" stroke="#166534" fontSize={11} tickMargin={6} />
                <YAxis stroke="#166534" fontSize={11} />
                <Tooltip
                  formatter={(v: number) => `₹${v}`}
                  labelStyle={{ color: "#166534" }}
                  contentStyle={{ borderRadius: 8, borderColor: "#bbf7d0" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="avgModal" name="Modal" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="avgMin" name="Min" stroke="#3b82f6" strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="avgMax" name="Max" stroke="#f59e0b" strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {trendLoading && trend.length === 0 && (
        <p className="text-xs text-gray-500 text-center mb-4">Loading trend…</p>
      )}

      {/* Price results */}
      {!loading && responseData && (
        <>
          {prices.length > 0 ? (
            <div className="space-y-4">
              {/* Mobile: cards. Desktop: table. */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse rounded-lg text-sm">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="border border-gray-200 p-3 text-left font-semibold">Market</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">District</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">Min</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">Max</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">Modal</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="border border-gray-200 p-3 font-medium">{p.market}</td>
                        <td className="border border-gray-200 p-3 text-gray-600">{p.district}</td>
                        <td className="border border-gray-200 p-3 text-center">₹{p.min}</td>
                        <td className="border border-gray-200 p-3 text-center">₹{p.max}</td>
                        <td className="border border-gray-200 p-3 text-center font-bold text-green-700">₹{p.modal}</td>
                        <td className="border border-gray-200 p-3 text-center text-xs text-gray-600">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {prices.map((p, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-3">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <p className="font-semibold text-gray-900 truncate">{p.market}</p>
                      <p className="text-green-700 font-bold">₹{p.modal}</p>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{p.district}</span>
                      <span>{p.date}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      min ₹{p.min} · max ₹{p.max}
                    </div>
                  </div>
                ))}
              </div>

              {/* Advice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-1.5 flex items-center gap-2 text-sm sm:text-base">
                  📍 Farmer advice
                </h3>
                <p className="text-sm text-blue-700">
                  {translatedAdvice || generateFarmerAdvice(prices, selectedCommodity)}
                </p>
                {selectedLanguage !== "en" && translatedAdvice && (
                  <div className="text-xs text-gray-500 mt-1">
                    Translated to {selectedLanguage.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-center text-xs text-gray-500 mt-2">
                <p>
                  {responseData?.message}
                  {responseData?.source === "live" && " · live ✓"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-5xl text-red-400 block mb-3">❌</span>
              <h3 className="text-lg font-semibold text-red-800 mb-1">No results</h3>
              <p className="text-red-700 text-sm mb-3">{responseData?.message}</p>
              <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
                <li>Try a different commodity</li>
                <li>Try a different state</li>
                <li>Remove the district filter</li>
              </ul>
            </div>
          )}
        </>
      )}

      {!loading && !responseData && (
        <div className="text-center text-gray-600 py-8">
          <span className="text-5xl block mb-3">🛒</span>
          <p className="text-sm sm:text-base">{t("mandi.selectAndClick")}</p>
        </div>
      )}
    </div>
  );
}
