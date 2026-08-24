import Link from "next/link"; import { getMessages } from "@/i18n/messages"; import { DEFAULT_THEMES } from "@/lib/themes";
import { AnimatedNav, AnimatedHero,
AnimatedSection, AnimatedGrid, } from "@/components/marketing/MarketingAnimations";
export default async function MarketingPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; const t = getMessages(locale);
const otherLocale = locale === "fr" ? "en" : "fr"; const features = [ { icon: "â–¤", title: t.marketing.f1Title, desc: t.marketing.f1Desc },
{ icon: "â—", title: t.marketing.f2Title, desc: t.marketing.f2Desc }, { icon: "âŒ˜", title: t.marketing.f3Title, desc: t.marketing.f3Desc }, { icon: "â–©", title: t.marketing.f4Title, desc: t.marketing.f4Desc },
{ icon: "Â¶", title: t.marketing.f5Title, desc: t.marketing.f5Desc }, { icon: "âœ‰", title: t.marketing.f6Title, desc: t.marketing.f6Desc }, ];
return ( <div className="bg-white"> {/* â”€â”€â”€â”€â”€ Nav â”€â”€â”€â”€â”€ */}
<AnimatedNav> <div className="flex items-center justify-between"> <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
<span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-[13px] font-bold text-white transition-transform group-hover:scale-110 group-hover:rotate-3"> B </span>
<span className="text-[15px] font-semibold tracking-tight text-zinc-900"> {t.common.appName} </span>
</Link> <nav className="flex items-center gap-1"> <Link
href={`/${otherLocale}`} className="rounded-full px-3 py-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-900" >
{otherLocale.toUpperCase()} </Link> <Link
href={`/${locale}/login`} className="rounded-full px-4 py-1.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900" >
{t.marketing.login} </Link> <Link
href={`/${locale}/register`} className="ml-1 rounded-full bg-zinc-900 px-5 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-[0.97]" >
{t.marketing.getStarted} </Link> </nav>
</div> </AnimatedNav> {/* â”€â”€â”€â”€â”€ Hero â”€â”€â”€â”€â”€ */}
<AnimatedHero> <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(24,24,27,0.06),transparent)]" /> <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-32 text-center sm:pb-32 sm:pt-40">
<span data-hero-badge className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600"
> <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t.common.tagline}
</span> <h1 data-hero-title
className="mt-6 text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-900 sm:text-6xl" > {t.marketing.heroTitleA}
<br /> <span className="text-zinc-400">{t.marketing.heroTitleB}</span> </h1>
<p data-hero-subtitle className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-zinc-600"
> {t.marketing.heroSubtitle} </p>
<div data-hero-buttons className="mt-9 flex flex-wrap items-center justify-center gap-3"
> <Link href={`/${locale}/register`}
className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 hover:scale-[1.03] active:scale-[0.98]" > {t.marketing.ctaPrimary}
</Link> <a href="#themes"
className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:scale-[1.03] active:scale-[0.98]" > {t.marketing.ctaSecondary}
</a> </div> <div
data-hero-preview className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_60px_-25px_rgba(24,24,27,0.35)]" >
<div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5"> <span className="size-2.5 rounded-full bg-zinc-300" /> <span className="size-2.5 rounded-full bg-zinc-300" />
<span className="size-2.5 rounded-full bg-zinc-300" /> <span className="ml-3 rounded-md bg-white px-2 py-0.5 text-[11px] text-zinc-400 ring-1 ring-zinc-200"> atelier-no17.batiste.app
</span> </div> <div className="grid grid-cols-3 gap-px bg-zinc-200 text-left">
<div className="col-span-1 space-y-2 bg-white p-4"> {["Hero", "Grille de cartes", "TÃ©moignages", "Contact"].map((block, i) => ( <div
key={block} className={`rounded-lg border px-3 py-2 text-[11px] transition-all ${ i === 0
? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500" }`}
> {block} </div>
))} </div> <div className="col-span-2 bg-white p-4">
<div className="h-24 rounded-lg bg-linear-to-br from-zinc-900 to-zinc-700" /> <div className="mt-3 h-2.5 w-2/3 rounded bg-zinc-200" /> <div className="mt-2 h-2.5 w-1/2 rounded bg-zinc-100" />
<div className="mt-4 grid grid-cols-3 gap-2"> {[0, 1, 2].map((i) => ( <div key={i} className="h-14 rounded-lg bg-zinc-100" />
))} </div> </div>
</div> </div> </div>
</AnimatedHero> {/* â”€â”€â”€â”€â”€ Features â”€â”€â”€â”€â”€ */} <AnimatedSection className="mx-auto max-w-6xl px-6 py-24">
<div className="max-w-2xl" data-anim="up"> <h2 className="text-3xl font-semibold tracking-tight text-zinc-900"> {t.marketing.featuresTitle}
</h2> <p className="mt-2 text-[15px] text-zinc-600">{t.marketing.featuresSubtitle}</p> </div>
<AnimatedGrid className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-3"> {features.map((feature) => ( <div
key={feature.title} className="bg-white p-7 transition-colors hover:bg-zinc-50" >
<span className="flex size-9 items-center justify-center rounded-xl bg-zinc-900 text-sm text-white transition-transform hover:scale-110 hover:rotate-3"> {feature.icon} </span>
<h3 className="mt-4 text-[15px] font-semibold tracking-tight text-zinc-900"> {feature.title} </h3>
<p className="mt-1.5 text-[13.5px] leading-relaxed text-zinc-600">{feature.desc}</p> </div> ))}
</AnimatedGrid> </AnimatedSection> {/* â”€â”€â”€â”€â”€ Themes â”€â”€â”€â”€â”€ */}
<AnimatedSection id="themes" className="border-y border-zinc-200 bg-zinc-50"> <div className="mx-auto max-w-6xl px-6 py-24"> <div className="max-w-2xl" data-anim="up">
<h2 className="text-3xl font-semibold tracking-tight text-zinc-900"> {t.marketing.themesTitle} </h2>
<p className="mt-2 text-[15px] text-zinc-600">{t.marketing.themesSubtitle}</p> </div> <AnimatedGrid className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
{DEFAULT_THEMES.map((theme) => ( <div key={theme.id}
className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg hover:-translate-y-1" > <div
className="flex h-32 flex-col justify-end p-4 transition-transform group-hover:scale-[1.02]" style={{ backgroundColor: theme.colors.surface }} >
<div className="h-2.5 w-2/3 rounded transition-all group-hover:w-3/4" style={{ backgroundColor: theme.colors.primary }}
/> <div className="mt-2 h-2 w-1/2 rounded opacity-40"
style={{ backgroundColor: theme.colors.text }} /> </div>
<div className="p-4"> <p className="text-sm font-semibold tracking-tight text-zinc-900">{theme.name}</p> <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
{theme.description} </p> </div>
</div> ))} </AnimatedGrid>
</div> </AnimatedSection> {/* â”€â”€â”€â”€â”€ Steps â”€â”€â”€â”€â”€ */}
<AnimatedSection className="mx-auto max-w-6xl px-6 py-24"> <h2 className="text-3xl font-semibold tracking-tight text-zinc-900" data-anim="up"> {t.marketing.stepsTitle}
</h2> <AnimatedGrid className="mt-12 grid gap-8 sm:grid-cols-3"> {[
[t.marketing.step1, t.marketing.step1Desc], [t.marketing.step2, t.marketing.step2Desc], [t.marketing.step3, t.marketing.step3Desc],
].map(([title, desc], index) => ( <div key={title} className="group border-t border-zinc-900 pt-5"> <span className="text-[12px] font-medium text-zinc-400 transition-colors group-hover:text-zinc-900">
0{index + 1} </span> <h3 className="mt-2 text-[15px] font-semibold tracking-tight text-zinc-900">{title}</h3>
<p className="mt-1 text-[13.5px] text-zinc-600">{desc}</p> </div> ))}
</AnimatedGrid> </AnimatedSection> {/* â”€â”€â”€â”€â”€ Final CTA â”€â”€â”€â”€â”€ */}
<AnimatedSection className="bg-zinc-900"> <div className="mx-auto max-w-3xl px-6 py-20 text-center"> <h2 className="text-3xl font-semibold tracking-tight text-white" data-anim="up">
{t.marketing.finalCta} </h2> <p className="mt-3 text-sm text-zinc-400" data-anim="up" data-delay="0.1">
{t.marketing.finalCtaDesc} </p> <div data-anim="scale" data-delay="0.2">
<Link href={`/${locale}/register`} className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 hover:scale-[1.05] active:scale-[0.97]"
> {t.marketing.ctaPrimary} </Link>
</div> </div> </AnimatedSection>
{/* â”€â”€â”€â”€â”€ Footer â”€â”€â”€â”€â”€ */} <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-10 text-[13px] text-zinc-500"> <span>
<span className="font-semibold text-zinc-900">{t.common.appName}</span> â€” {t.marketing.footer} </span> <span>Â© {new Date().getFullYear()}</span>
</footer> </div> );
}
