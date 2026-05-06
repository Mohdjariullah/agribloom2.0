import { T } from "@/components/T";

/**
 * Standard page header used across the app — eyebrow + headline + subtitle.
 * Auto-translates all three strings via the <T> component, so any page using
 * <PageHeader> gets full Hindi / Tamil / etc. support for free.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  children?: React.ReactNode;
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <header className={`mb-8 sm:mb-10 max-w-3xl ${alignment}`}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
          <T>{eyebrow}</T>
        </p>
      )}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900 leading-[1.1] mb-3">
        <T>{title}</T>
      </h1>
      {subtitle && (
        <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
          <T>{subtitle}</T>
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-14 px-4">
      <div className="max-w-6xl mx-auto">{children}</div>
    </main>
  );
}
