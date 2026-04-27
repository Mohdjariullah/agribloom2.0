"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, RefreshCw } from "lucide-react";

interface CropEntry {
  _id: string;
  crop: string;
  district: string;
  village: string;
  sowingDate: string;
  area: number;
  season: string;
  farmerId: {
    _id: string;
    username: string;
    email: string;
  } | null;
}

export default function AdminAnalysisPage() {
  const [entries, setEntries] = useState<CropEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crop-entries");
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch failed", err);
      toast.error("Couldn't load crop entries");
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this crop entry? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/admin/crop-entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Deleted");
        setEntries((prev) => prev.filter((e) => e._id !== id));
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
              Admin · Crop entries
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
              {entries.length} crop {entries.length === 1 ? "entry" : "entries"}
            </h1>
            <p className="text-stone-600 text-sm mt-1">
              Everything farmers have logged so far. Filter or delete from here.
            </p>
          </div>
          <button
            onClick={fetchEntries}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-10 text-center text-stone-500 text-sm">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="p-10 text-center text-stone-500 text-sm">
              No crop entries yet.
            </p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-stone-700">
                    <tr>
                      <Th>Crop</Th>
                      <Th>Farmer</Th>
                      <Th>District / Village</Th>
                      <Th>Sown</Th>
                      <Th right>Area</Th>
                      <Th>Season</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {entries.map((e) => (
                      <tr key={e._id} className="hover:bg-stone-50/60">
                        <Td>
                          <span className="font-medium text-stone-900 capitalize">
                            {e.crop}
                          </span>
                        </Td>
                        <Td>
                          <div className="text-stone-900">
                            {e.farmerId?.username || "(deleted)"}
                          </div>
                          {e.farmerId?.email && (
                            <div className="text-xs text-stone-500">{e.farmerId.email}</div>
                          )}
                        </Td>
                        <Td>
                          <div className="text-stone-700">{e.district}</div>
                          {e.village && (
                            <div className="text-xs text-stone-500">{e.village}</div>
                          )}
                        </Td>
                        <Td>
                          <span className="text-stone-700">
                            {new Date(e.sowingDate).toLocaleDateString()}
                          </span>
                        </Td>
                        <Td right>
                          <span className="text-stone-900 font-medium">
                            {e.area}
                          </span>
                          <span className="text-xs text-stone-500 ml-1">acres</span>
                        </Td>
                        <Td>
                          <span className="bg-stone-100 text-stone-700 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full capitalize">
                            {e.season}
                          </span>
                        </Td>
                        <Td>
                          <button
                            onClick={() => deleteEntry(e._id)}
                            aria-label="Delete entry"
                            className="text-stone-400 hover:text-red-600 transition-colors p-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-stone-100">
                {entries.map((e) => (
                  <div key={e._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900 capitalize">{e.crop}</p>
                        <p className="text-xs text-stone-500 mt-0.5 truncate">
                          {e.farmerId?.username || "(deleted)"} · {e.district}
                        </p>
                        <p className="text-xs text-stone-400 mt-1">
                          {new Date(e.sowingDate).toLocaleDateString()} · {e.area} acres ·{" "}
                          <span className="capitalize">{e.season}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => deleteEntry(e._id)}
                        aria-label="Delete entry"
                        className="text-stone-400 hover:text-red-600 transition-colors p-1.5 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Th({
  children,
  right,
}: {
  children?: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`text-xs uppercase tracking-wider font-semibold px-4 py-3 ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  right,
}: {
  children?: React.ReactNode;
  right?: boolean;
}) {
  return (
    <td className={`px-4 py-3 align-top ${right ? "text-right" : ""}`}>{children}</td>
  );
}
