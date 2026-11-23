import { PROJECTS } from './projects'
import { DOMAINS } from './skills'
import { t, CONTACT, type Lang } from './i18n'

// Plain, fully static list of every project: no WebGL, no animation, works with keyboard and screen readers
export default function Simple({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const s = t[lang]
  return (
    <div className="simple h-full overflow-y-auto bg-ink-2">
      <div className="mx-auto max-w-4xl px-5 py-10 md:py-16">
        <nav className="flex items-center justify-between gap-3">
          <a href="#" className="tag flex h-9 items-center px-4 text-sm font-semibold">← {s.simpleBack}</a>
          <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="tag h-9 px-3 text-sm font-semibold">{lang === 'fr' ? 'EN' : 'FR'}</button>
        </nav>
        <header className="mt-10">
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">Rassoul</h1>
          <p className="mt-2 text-lg font-semibold text-mint">{s.role}</p>
          <p className="mt-4 max-w-2xl text-paper/75">{s.introText}</p>
          <p className="mt-4 flex flex-wrap gap-3 text-sm">
            <a className="underline underline-offset-4" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a className="underline underline-offset-4" href={CONTACT.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
          </p>
        </header>
        <h2 className="mt-14 text-xs font-semibold tracking-[.3em] text-mint uppercase">{s.simpleProjects}</h2>
        <ol className="mt-6 grid gap-10">
          {PROJECTS.map((p, i) => (
            <li key={p.id} className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
              <img src={`/projects/${p.id}.webp`} alt={`${p.name} — ${s.shotDesktop}`} loading={i < 2 ? 'eager' : 'lazy'} width={1200} height={750} className="h-auto w-full rounded-lg border border-paper/10" />
              <div>
                <p className="font-mono text-xs text-paper/50">{String(i + 1).padStart(2, '0')} · {p.kind[lang]}</p>
                <h3 className="mt-1 text-2xl font-black tracking-tight">{p.name}</h3>
                <p className="mt-2 text-paper/80">{p.problem[lang]}</p>
                <p className="mt-3 text-sm text-paper/55">{p.stack.join(' · ')}</p>
                {p.links.map(l => <a key={l.url} href={l.url} target="_blank" rel="noopener" className="mt-2 mr-3 inline-block text-sm text-mint underline underline-offset-4">{l.label} ↗</a>)}
              </div>
            </li>
          ))}
        </ol>
        <h2 className="mt-16 text-xs font-semibold tracking-[.3em] text-mint uppercase">{s.skillsKicker}</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {DOMAINS.map(d => (
            <section key={d.id}>
              <h3 className="text-xl font-black">{d.title[lang]}</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {d.skills.map(sk => (
                  <li key={sk.name.en}><span className="font-semibold">{sk.name[lang]}</span> <span className="text-paper/55">— {sk.proof[lang]}</span></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-16 text-paper/70">{s.contactText}</p>
        <p className="mt-2 flex flex-wrap gap-4 font-semibold">
          <a className="underline underline-offset-4" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a className="underline underline-offset-4" href={CONTACT.whatsapp} target="_blank" rel="noopener">WhatsApp {CONTACT.phone}</a>
        </p>
      </div>
    </div>
  )
}
