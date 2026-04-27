import Link from "next/link";
import Image from "next/image";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#fafaf7] grid lg:grid-cols-2">
      {/* Left brand panel — hidden on mobile */}
      <aside className="hidden lg:flex flex-col justify-between bg-stone-900 text-stone-100 p-12 xl:p-16">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/nature/logo.jpg"
            alt="AgriBloom"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <span className="text-base font-semibold tracking-tight">AgriBloom</span>
        </Link>

        <div className="max-w-md">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-4">
            What you get
          </p>
          <h2 className="text-3xl xl:text-4xl font-semibold tracking-tight leading-[1.15] mb-6">
            Practical farming tools, drawn from government data.
          </h2>
          <ul className="space-y-2.5 text-stone-300 text-[15px]">
            <li>· 200+ crop guides with seasons, soil, water needs</li>
            <li>· Live mandi prices from AGMARKNET</li>
            <li>· Weather forecasts with crop-specific alerts</li>
            <li>· Pest, disease and fertilizer guidance</li>
            <li>· An assistant that ties it all together</li>
          </ul>
        </div>

        <p className="text-xs text-stone-500">
          Sourced from data.gov.in, OpenWeatherMap, ICAR and KVKs.
        </p>
      </aside>

      {/* Right form panel */}
      <section className="flex flex-col">
        <header className="flex items-center justify-between px-6 sm:px-10 py-6">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <Image
              src="/nature/logo.jpg"
              alt="AgriBloom"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <span className="font-semibold text-stone-900">AgriBloom</span>
          </Link>
          <span className="hidden lg:block" />
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
            ← Back to home
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-stone-600 text-[15px] leading-relaxed">{subtitle}</p>
              )}
            </div>

            {children}

            {footer && (
              <p className="mt-8 text-sm text-stone-500 text-center">{footer}</p>
            )}
          </div>
        </div>

        <footer className="px-6 sm:px-10 py-5 text-xs text-stone-400 text-center lg:text-left">
          © {new Date().getFullYear()} AgriBloom
        </footer>
      </section>
    </main>
  );
}

// Small reusable form primitives so login/signup look identical.
export function FormLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-stone-800">
        {children}
      </label>
      {hint && <span className="text-xs text-stone-500">{hint}</span>}
    </div>
  );
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2.5 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition disabled:bg-stone-50 disabled:opacity-60 ${
        props.className ?? ""
      }`}
    />
  );
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2.5 text-[15px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition ${
        props.className ?? ""
      }`}
    />
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-medium py-3 rounded-full transition-colors ${
        props.className ?? ""
      }`}
    />
  );
}
