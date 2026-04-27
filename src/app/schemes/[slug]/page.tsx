import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Phone, FileText, CheckCircle2, Building2 } from "lucide-react";
import { connectToDB } from "@/dbConfig/dbConfig";
import GovtScheme from "@/models/GovtScheme";
import type { IGovtScheme } from "@/models/GovtScheme";

export const dynamic = "force-dynamic";

async function getScheme(slug: string): Promise<IGovtScheme | null> {
  await connectToDB();
  return GovtScheme.findOne({ slug }).lean<IGovtScheme>();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scheme = await getScheme(slug);
  if (!scheme) return { title: "Scheme not found · AgriBloom" };
  return {
    title: `${scheme.name} · AgriBloom`,
    description: scheme.description?.slice(0, 160),
  };
}

export default async function SchemeDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scheme = await getScheme(slug);
  if (!scheme) notFound();

  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/schemes"
          className="text-sm text-stone-500 hover:text-stone-900 inline-block mb-6"
        >
          ← All schemes
        </Link>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-stone-100 bg-gradient-to-br from-stone-50 to-white">
            {scheme.shortName && (
              <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-1 rounded mb-3">
                {scheme.shortName}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
              {scheme.name}
            </h1>
            <p className="text-stone-600 leading-relaxed text-base sm:text-lg">
              {scheme.description}
            </p>
            {scheme.officialUrl && (
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
              >
                Apply on official portal
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {scheme.benefits && (
              <Section title="What you get">
                <p className="text-stone-700 leading-relaxed">{scheme.benefits}</p>
              </Section>
            )}

            {scheme.eligibility?.length > 0 && (
              <Section title="Eligibility">
                <ul className="space-y-2">
                  {scheme.eligibility.map((e, i) => (
                    <li key={i} className="flex gap-2.5 text-stone-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {scheme.applicationProcess && (
              <Section title="How to apply">
                <p className="text-stone-700 leading-relaxed">{scheme.applicationProcess}</p>
              </Section>
            )}

            {scheme.requiredDocuments?.length > 0 && (
              <Section title="Documents required">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scheme.requiredDocuments.map((d, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                      <FileText className="h-3.5 w-3.5 text-stone-500 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-stone-100">
              {scheme.ministry && (
                <Card icon={<Building2 className="h-4 w-4" />} label="Ministry" value={scheme.ministry} />
              )}
              {scheme.helpline && (
                <Card icon={<Phone className="h-4 w-4" />} label="Helpline" value={scheme.helpline} />
              )}
            </div>

            {scheme.applicableStates?.length > 0 && (
              <Section title="Applicable states">
                <div className="flex flex-wrap gap-1.5">
                  {scheme.applicableStates.map((s) => (
                    <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
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

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
      <p className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider mb-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-stone-900">{value}</p>
    </div>
  );
}
