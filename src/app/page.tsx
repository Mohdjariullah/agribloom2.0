import Link from "next/link";
import {
  ArrowUpRight,
  Sprout,
  ShoppingCart,
  Cloud,
  Bug,
  FlaskConical,
  Leaf,
  FileText,
} from "lucide-react";
import Footer from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="bg-[#fafaf7] text-stone-900">
      <Hero />
      <Modules />
      <Trust />
      <Closing />
      <Footer />
      <ChatWidget />
    </main>
  );
}

function Hero() {
  return (
    <section className="border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-6">
          AgriBloom
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6 max-w-3xl">
          Practical farming tools,
          <br className="hidden sm:block" />
          <span className="text-stone-500"> in one place.</span>
        </h1>
        <p className="text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl mb-10">
          Crop guides, mandi rates, weather and pest control — drawn from
          government data and ICAR research. No fluff.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-medium px-6 py-3.5 rounded-full transition-colors"
          >
            Create an account
          </Link>
          <Link
            href="/mandi-prices"
            className="inline-flex items-center justify-center gap-1.5 text-stone-700 hover:text-stone-900 font-medium px-3 py-3.5 transition-colors"
          >
            Browse the tools
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Modules() {
  const modules = [
    {
      icon: <Sprout className="h-5 w-5" />,
      title: "Crop guides",
      desc: "200+ Indian crops with seasons, soil, and water needs.",
      href: "/agrilens",
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "Mandi prices",
      desc: "Today’s wholesale rates with a 7-day trend per commodity.",
      href: "/mandi-prices",
    },
    {
      icon: <Cloud className="h-5 w-5" />,
      title: "Weather",
      desc: "5-day forecast with alerts tied to crops in your district.",
      href: "/weather",
    },
    {
      icon: <Bug className="h-5 w-5" />,
      title: "Pest & disease",
      desc: "Search by crop, see symptoms and prevention steps.",
      href: "/insect",
    },
    {
      icon: <FlaskConical className="h-5 w-5" />,
      title: "Fertilizer",
      desc: "NPK targets and dose schedules per crop.",
      href: "/fertilizer",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Govt schemes",
      desc: "30+ subsidies, insurance and credit programmes for farmers.",
      href: "/schemes",
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      title: "Soil & techniques",
      desc: "Soil-type primer and farming method overviews.",
      href: "/soil",
    },
  ];
  return (
    <section className="border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="mb-12 sm:mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-4">
            What’s inside
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">
            Six tools, all using the same trusted sources.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-2 divide-y divide-stone-200 sm:divide-y-0">
          {modules.map((m, i) => (
            <Link
              key={m.title}
              href={m.href}
              className={`group flex items-start gap-4 py-5 sm:py-6 ${
                i % 2 === 0 ? "sm:pr-8" : "sm:pl-8"
              } sm:border-b sm:border-stone-200`}
            >
              <span className="flex-shrink-0 mt-0.5 text-stone-700 group-hover:text-green-700 transition-colors">
                {m.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                  {m.title}
                  <ArrowUpRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-green-700 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const points = [
    {
      title: "Government & research data only",
      body:
        "Mandi prices come from data.gov.in (AGMARKNET). Weather is OpenWeatherMap. Crop and fertilizer guidance is drawn from ICAR and Krishi Vigyan Kendra publications.",
    },
    {
      title: "Built for the way farmers actually work",
      body:
        "Mobile-first, low-bandwidth, in your language. Pick a state and crop and get straight to the answer — no carousels, no clutter.",
    },
    {
      title: "Free to use",
      body:
        "Sign up to save your district and crops for personalized prices and weather. Or browse without an account.",
    },
  ];

  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="mb-12 sm:mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-4">
            Why AgriBloom
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">
            Honest data. Plain language. Nothing made up.
          </h2>
        </div>
        <div className="space-y-10 max-w-3xl">
          {points.map((p) => (
            <div key={p.title}>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">{p.title}</h3>
              <p className="text-stone-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="bg-[#fafaf7]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-20 sm:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-5">
            Ready when you are.
          </h2>
          <p className="text-stone-600 leading-relaxed mb-8">
            Create an account to save your state, district and crops. We’ll show prices and
            weather tailored to where you farm.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-stone-900 hover:bg-stone-800 text-white font-medium px-6 py-3.5 rounded-full transition-colors"
            >
              Create your free account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center text-stone-700 hover:text-stone-900 font-medium px-3 py-3.5 transition-colors"
            >
              I already have one
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
