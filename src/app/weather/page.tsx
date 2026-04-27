"use client";

import { useState, useEffect } from "react";
import {
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  MapPin,
  Sun,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageHeader";

type Forecast = {
  date: string;
  tempMin: number;
  tempMax: number;
  rainMm: number;
  condition: string;
  icon?: string;
};

type WeatherResponse = {
  location: string | null;
  current: {
    temp: number;
    feelsLike?: number;
    humidity: number;
    rain: number;
    condition: string;
  };
  forecast: Forecast[];
  alert: string;
  cropAlerts: { crop: string; severity: "info" | "warn" | "danger"; message: string }[];
};

export default function WeatherPage() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileState, setProfileState] = useState<string | undefined>();

  // Pull state from user profile so crop-specific alerts work
  useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((j) => setProfileState(j?.data?.state))
      .catch(() => {});
  }, []);

  const fetchWeather = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLoading(true);
    setError("");
    setData(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/weather", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              state: profileState,
            }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
          setData(json);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch weather");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message || "Couldn't get your location");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Weather"
        title="Today's forecast, plus what it means for your crops."
        subtitle="Tap below to share your location. We pull a 5-day OpenWeatherMap forecast and flag temp or rain that could affect crops in your district."
      />

      {!data && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 sm:p-10 max-w-2xl text-center">
          <Sun className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-700 font-medium mb-1">No location yet</p>
          <p className="text-sm text-stone-500 mb-5">
            We use your browser&apos;s location once — nothing is stored unless you save it to your
            profile.
          </p>
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            {loading ? "Getting weather…" : "Use my location"}
          </button>
          {error && (
            <p className="text-red-600 text-sm mt-4 flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
        </div>
      )}

      {data && (
        <div className="space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
                  {data.location || "Your location"}
                </p>
                <p className="text-5xl sm:text-6xl font-bold text-stone-900 tracking-tight">
                  {data.current.temp}°
                </p>
                <p className="text-stone-600 capitalize mt-1">{data.current.condition}</p>
              </div>
              <button
                onClick={fetchWeather}
                disabled={loading}
                className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-stone-100">
              <Stat icon={<Thermometer className="w-3.5 h-3.5" />} label="Feels like" value={`${data.current.feelsLike ?? data.current.temp}°`} />
              <Stat icon={<Droplets className="w-3.5 h-3.5" />} label="Humidity" value={`${data.current.humidity}%`} />
              <Stat icon={<Wind className="w-3.5 h-3.5" />} label="Rain (1h)" value={`${data.current.rain} mm`} />
            </div>
          </div>

          {/* General advice */}
          {data.alert && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-700">
              {data.alert}
            </div>
          )}

          {/* Crop alerts */}
          {data.cropAlerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-800 mb-3">
                <AlertTriangle className="w-3.5 h-3.5" />
                Crop alerts
              </h3>
              <ul className="space-y-2">
                {data.cropAlerts.map((a, i) => (
                  <li key={i} className="text-sm text-amber-900 leading-relaxed">
                    <span className="font-medium">{a.crop}:</span> {a.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5-day forecast */}
          {data.forecast.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
              <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-4">5-day forecast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {data.forecast.map((d) => (
                  <div key={d.date} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-stone-500">
                      {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <p className="text-lg font-semibold text-stone-900 mt-1">
                      {d.tempMax}° / {d.tempMin}°
                    </p>
                    <p className="text-[11px] text-stone-600 capitalize truncate" title={d.condition}>
                      {d.condition}
                    </p>
                    {d.rainMm > 0 && (
                      <p className="text-[10px] text-blue-700 mt-1">
                        {d.rainMm} mm rain
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stone-500 mb-1">
        {icon}
        {label}
      </p>
      <p className="text-stone-900 font-medium">{value}</p>
    </div>
  );
}
