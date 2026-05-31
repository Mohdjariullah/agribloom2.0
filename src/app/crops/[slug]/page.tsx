import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDB } from "@/dbConfig/dbConfig";
import Crop from "@/models/Crop";
import type { ICrop } from "@/models/Crop";
import { CropVisual } from "@/components/CropVisual";

export const dynamic = "force-dynamic";

async function getCrop(slug: string): Promise<ICrop | null> {
  await connectToDB();
  const doc = await Crop.findOne({ slug }).lean<ICrop>();
  return doc;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const crop = await getCrop(slug);
  if (!crop) return { title: "Crop not found · AgriBloom" };
  return {
    title: `${crop.name} · AgriBloom`,
    description: crop.description ?? `Growing guide for ${crop.name} — season, soil, water, sunlight requirements.`,
  };
}

export default async function CropDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const crop = await getCrop(slug);
  if (!crop) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link
        href="/agrilens"
        className="text-green-700 hover:text-green-800 text-sm font-medium inline-block mb-6"
      >
        ← Back to all crops
      </Link>

      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-green-100">
        <div className="relative">
          <CropVisual
            name={crop.name}
            category={crop.category}
            className="h-40 md:h-52 w-full"
          />
          <div className="px-6 sm:px-8 py-6 border-b border-green-50">
            <span className="inline-block text-xs uppercase tracking-wider bg-green-50 text-green-700 px-3 py-1 rounded-full mb-3">
              {crop.category.replace("_", " ")}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900">
              {crop.name}
            </h1>
            {crop.scientificName && (
              <p className="text-stone-500 italic mt-1">{crop.scientificName}</p>
            )}
          </div>
        </div>

        <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="🌱 Growth" tone="green">
            {crop.season?.length ? (
              <Row label="Season">
                <span className="capitalize">{crop.season.join(", ")}</span>
              </Row>
            ) : null}
            {crop.sowingMonth && <Row label="Sowing month">{crop.sowingMonth}</Row>}
            {crop.floweringPeriod && <Row label="Flowering">{crop.floweringPeriod}</Row>}
            {crop.harvestingMonth && <Row label="Harvest">{crop.harvestingMonth}</Row>}
            {crop.growingDurationDays && (
              <Row label="Duration">{crop.growingDurationDays} days</Row>
            )}
          </Section>

          <Section title="💧 Requirements" tone="amber">
            {crop.waterRequirementText && <Row label="Water">{crop.waterRequirementText}</Row>}
            {crop.waterRequirement && (
              <Row label="Need">
                <span className="capitalize">{crop.waterRequirement}</span>
              </Row>
            )}
            {crop.sunlightRequirement && (
              <Row label="Sunlight">{crop.sunlightRequirement}</Row>
            )}
            {(crop.idealTempMinC || crop.idealTempMaxC) && (
              <Row label="Temperature">
                {crop.idealTempMinC ?? "?"}–{crop.idealTempMaxC ?? "?"}°C
              </Row>
            )}
            {crop.idealRainfallMm && (
              <Row label="Rainfall">{crop.idealRainfallMm} mm/year</Row>
            )}
          </Section>

          {crop.soilTypes?.length ? (
            <Section title="🪨 Soil" tone="stone" wide>
              <div className="flex flex-wrap gap-2">
                {crop.soilTypes.map((s, i) => (
                  <span
                    key={i}
                    className="bg-white px-3 py-1 rounded-full text-sm border border-stone-200 text-stone-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {crop.seedVarieties?.length ? (
            <Section title="🌾 Varieties" tone="emerald" wide>
              <div className="flex flex-wrap gap-2">
                {crop.seedVarieties.map((v, i) => (
                  <span
                    key={i}
                    className="bg-white px-3 py-1 rounded-full text-sm border border-emerald-200 text-emerald-800"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {crop.states?.length ? (
            <Section title="📍 Grown in" tone="blue" wide>
              <div className="flex flex-wrap gap-2">
                {crop.states.map((s, i) => (
                  <span
                    key={i}
                    className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200 text-blue-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {crop.description && (
            <Section title="ℹ️ About" tone="green" wide>
              <p className="text-gray-700 leading-relaxed">{crop.description}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

const TONES = {
  green: "bg-green-50 text-green-800",
  amber: "bg-amber-50 text-amber-800",
  blue: "bg-blue-50 text-blue-800",
  emerald: "bg-emerald-50 text-emerald-800",
  stone: "bg-stone-50 text-stone-800",
} as const;

function Section({
  title,
  tone,
  wide,
  children,
}: {
  title: string;
  tone: keyof typeof TONES;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`p-5 rounded-2xl ${TONES[tone]} ${wide ? "md:col-span-2" : ""}`}>
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className="space-y-1.5 text-gray-700">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-sm">
      <span className="font-medium text-gray-900">{label}:</span>{" "}
      <span>{children}</span>
    </p>
  );
}
