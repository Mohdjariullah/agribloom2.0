import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDB } from "@/dbConfig/dbConfig";
import Pest from "@/models/Pest";
import type { IPest } from "@/models/Pest";

export const dynamic = "force-dynamic";

const SEVERITY_TONE: Record<string, string> = {
  low: "bg-green-50 text-green-800 border-green-200",
  medium: "bg-yellow-50 text-yellow-800 border-yellow-200",
  high: "bg-orange-50 text-orange-800 border-orange-200",
  critical: "bg-red-50 text-red-800 border-red-200",
};

async function getPest(slug: string): Promise<IPest | null> {
  await connectToDB();
  return Pest.findOne({ slug }).lean<IPest>();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pest = await getPest(slug);
  if (!pest) return { title: "Pest not found · AgriBloom" };
  return {
    title: `${pest.name} · AgriBloom`,
    description: pest.symptoms?.slice(0, 160),
  };
}

export default async function PestDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pest = await getPest(slug);
  if (!pest) notFound();

  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/insect"
          className="text-sm text-stone-500 hover:text-stone-900 inline-block mb-6"
        >
          ← All pests
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-stone-100">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
              {pest.type}
            </p>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
                {pest.name}
              </h1>
              {pest.severity && (
                <span
                  className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    SEVERITY_TONE[pest.severity] ?? "bg-stone-100 text-stone-700 border-stone-200"
                  }`}
                >
                  {pest.severity}
                </span>
              )}
            </div>
            {pest.affectedCrops?.length > 0 && (
              <p className="text-sm text-stone-600">
                <span className="text-stone-500">Affects:</span>{" "}
                {pest.affectedCrops.join(", ")}
              </p>
            )}
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {pest.symptoms && (
              <Section title="Symptoms">
                <p className="text-stone-700 leading-relaxed whitespace-pre-line">{pest.symptoms}</p>
              </Section>
            )}

            {pest.favorableConditions && (
              <Section title="Favorable conditions">
                <p className="text-stone-700">{pest.favorableConditions}</p>
              </Section>
            )}

            {pest.prevention?.length > 0 && (
              <Section title="Prevention & control">
                <ul className="space-y-2.5">
                  {pest.prevention.map((p, i) => (
                    <li key={i} className="flex gap-2.5 text-stone-700 text-sm leading-relaxed">
                      <span className="text-stone-400 flex-shrink-0">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {pest.chemicalControl?.length > 0 && (
              <Section title="Chemical control">
                <ul className="space-y-1.5 list-disc list-inside text-stone-700 text-sm">
                  {pest.chemicalControl.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </Section>
            )}

            {pest.organicControl?.length > 0 && (
              <Section title="Organic control">
                <ul className="space-y-1.5 list-disc list-inside text-stone-700 text-sm">
                  {pest.organicControl.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">{title}</h2>
      {children}
    </div>
  );
}
