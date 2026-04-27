import { AlertTriangle } from "lucide-react";
import { CropImage } from "@/components/CropImage";
import { PageHeader, PageShell } from "@/components/PageHeader";

export default function TreesPage() {
  const medicinalTrees = [
    {
      name: "Neem (Azadirachta indica)",
      benefits: "Antibacterial, antifungal, blood purifier; used in dental care and skin issues.",
      found: "Almost all Indian states — field borders, near homes.",
      parts: "Leaves, bark, seeds, oil",
      image: "/nature/neem.jpg",
    },
    {
      name: "Amla (Phyllanthus emblica)",
      benefits: "Vitamin C powerhouse; immunity, digestion, liver health.",
      found: "UP, MP, Rajasthan, forest belts",
      parts: "Fruit (fresh / dried)",
      image: "/nature/amla.jpg",
    },
    {
      name: "Arjuna (Terminalia arjuna)",
      benefits: "Cardiac health, controls cholesterol.",
      found: "Riverbanks in MP, Odisha, Bengal",
      parts: "Bark",
      image: "/nature/arjuna.jpg",
    },
    {
      name: "Bael (Aegle marmelos)",
      benefits: "Digestive aid, cooling effect.",
      found: "Northern & Central dry forests",
      parts: "Fruit, leaves, bark",
      image: "/nature/bael.jpg",
    },
    {
      name: "Ashoka (Saraca asoca)",
      benefits: "Menstrual relief, anti-inflammatory.",
      found: "Western Ghats, Assam",
      parts: "Bark, flowers",
      image: "/nature/ashoka.jpg",
    },
    {
      name: "Peepal (Ficus religiosa)",
      benefits: "Used for respiratory issues, skin; spiritual significance.",
      found: "Throughout India — roadsides, temples",
      parts: "Bark, leaves, fruit",
      image: "/nature/peepal.jpg",
    },
    {
      name: "Tulsi (Ocimum sanctum)",
      benefits: "Cough relief, stress reduction, immunity.",
      found: "Pan-India — courtyards, temples",
      parts: "Leaves, seeds",
      image: "/nature/tulsi.jpg",
    },
  ];

  const poisonousPlants = [
    { name: "Datura (Datura stramonium)", effects: "Hallucinogenic; toxic seeds and flowers.", found: "Fallow lands, village edges", image: "/nature/datura.jpg" },
    { name: "Castor Plant (Ricinus communis)", effects: "Ricin in seeds; causes liver damage.", found: "Weedy village areas", image: "/nature/castor.jpg" },
    { name: "Calotropis (C. gigantea / procera)", effects: "Milky latex causes skin and eye issues.", found: "Roadsides, dry land", image: "/nature/calotropis.jpg" },
    { name: "Oleander (Nerium oleander)", effects: "Entire plant is toxic; affects heart.", found: "Garden edges, roadsides", image: "/nature/oleander.jpg" },
    { name: "Lantana (Lantana camara)", effects: "Liver-toxic berries; affects cattle.", found: "Field edges, forests", image: "/nature/lantana.jpg" },
    { name: "Parthenium (Parthenium hysterophorus)", effects: "Allergy-causing weed.", found: "Canal banks, waste fields", image: "/nature/parthenium.jpg" },
    { name: "Yellow Oleander (Thevetia peruviana)", effects: "Seeds are deadly if chewed.", found: "Fenced gardens, village borders", image: "/nature/yellow-oleander.jpg" },
    { name: "Rosary Pea (Abrus precatorius)", effects: "Red-black seeds are extremely poisonous.", found: "Hedgerows, fence lines", image: "/nature/rosary-pea.jpg" },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Trees & plants"
        title="Healers and hazards in the Indian field."
        subtitle="The trees you should know about — for what they cure, and what to avoid."
      />

      {/* Medicinal */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Medicinal trees</h2>
          <span className="text-xs uppercase tracking-wider text-stone-500">7 listed</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicinalTrees.map((p) => (
            <div
              key={p.name}
              className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              <div className="relative h-44 bg-stone-50">
                <CropImage src={p.image} alt={p.name} fill className="object-cover" />
                <span className="absolute top-3 right-3 bg-green-50 text-green-800 border border-green-200 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full">
                  Medicinal
                </span>
              </div>
              <div className="p-5 flex-1 space-y-3">
                <h3 className="font-semibold text-stone-900">{p.name}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{p.benefits}</p>
                <Row label="Found in" value={p.found} />
                <Row label="Parts used" value={p.parts} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Poisonous */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Poisonous plants</h2>
          <span className="text-xs uppercase tracking-wider text-stone-500">8 listed</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {poisonousPlants.map((p) => (
            <div
              key={p.name}
              className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              <div className="relative h-44 bg-stone-50">
                <CropImage src={p.image} alt={p.name} fill className="object-cover" />
                <span className="absolute top-3 right-3 bg-red-50 text-red-800 border border-red-200 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full">
                  Poisonous
                </span>
              </div>
              <div className="p-5 flex-1 space-y-3">
                <h3 className="font-semibold text-stone-900">{p.name}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{p.effects}</p>
                <Row label="Found in" value={p.found} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3 max-w-3xl">
        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 mb-1">A safety note</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            Many of these plants are medicinal, but improper use can cause harm. Don&apos;t consume
            anything you can&apos;t identify with certainty, and keep the poisonous ones away from
            children and livestock.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-0.5">{label}</p>
      <p className="text-sm text-stone-700">{value}</p>
    </div>
  );
}
