import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from 'react'
import { PROJECTS, type Project } from './projects'
import { DOMAINS } from './skills'
import { t, CONTACT, type Lang } from './i18n'
import type { ScrollState } from './InsideScene'

const InsideScene = lazy(() => import('./InsideScene'))
const N = PROJECTS.length
const clamp = (v: number) => Math.min(1, Math.max(0, v))
// Stage position inside the scroller (offsetTop would be relative to its section)
const stageTop = (el: HTMLElement, sg: HTMLElement) => sg.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop

type Props = { lang: Lang; reduced: boolean; visible: boolean; webgl: boolean }

export default function Inside({ lang, reduced, visible, webgl }: Props) {
  const s = t[lang]
  const scroller = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const skills = useRef<HTMLElement>(null)
  const contact = useRef<HTMLElement>(null)
  const st = useRef<ScrollState>({ intro: 0, enter: 0, proj: 0, skills: 0, domain: 0, contact: 0 }).current
  const [domain, setDomain] = useState(0)
  const [copied, setCopied] = useState(false)
  const [active, setActive] = useState(0)
  const [detail, setDetail] = useState<Project | null>(null)

  useEffect(() => {
    const el = scroller.current!, sg = stage.current!
    const on = () => {
      const vh = el.clientHeight, y = el.scrollTop
      const top = stageTop(el, sg), span = sg.offsetHeight - vh
      st.intro = clamp(y / vh)
      st.enter = clamp((y - (top - vh)) / vh)
      st.proj = clamp((y - top) / span) * (N - 1)
      st.skills = clamp((y - (stageTop(el, skills.current!) - vh)) / vh)
      st.contact = clamp((y - (stageTop(el, contact.current!) - vh)) / vh)
      setActive(Math.round(st.proj))
    }
    on()
    el.addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { el.removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [st])

  // Reveal-on-scroll for [data-reveal]
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { root: scroller.current, threshold: 0.2 })
    scroller.current!.querySelectorAll('[data-reveal]').forEach(n => io.observe(n))
    return () => io.disconnect()
  }, [])

  // Active skill domain = the panel crossing the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { st.domain = Number((e.target as HTMLElement).dataset.domain); setDomain(st.domain) }
    }), { root: scroller.current, rootMargin: '-45% 0px -45% 0px' })
    scroller.current!.querySelectorAll('[data-domain]').forEach(n => io.observe(n))
    return () => io.disconnect()
  }, [st])

  useEffect(() => {
    if (visible) { scroller.current!.scrollTop = 0; scroller.current!.focus({ preventScroll: true }) }
  }, [visible])

  const goTo = (i: number) => {
    const el = scroller.current!, sg = stage.current!
    const span = sg.offsetHeight - el.clientHeight
    el.scrollTo({ top: stageTop(el, sg) + (span * ((i + N) % N)) / (N - 1), behavior: reduced ? 'auto' : 'smooth' })
  }
  const pick = (i: number) => (i === active ? openDetail(PROJECTS[i]) : goTo(i))
  const openDetail = (p: Project) => { setDetail(p); dialog.current?.showModal() }
  const copyEmail = () => navigator.clipboard?.writeText(CONTACT.email).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })

  const p = PROJECTS[active]

  return (
    <div className={`absolute inset-0 bg-ink-2 transition-opacity duration-700 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!visible}>
      {webgl && <Suspense fallback={null}>
        <InsideScene st={st} reduced={reduced} paused={!visible} eventSource={scroller as RefObject<HTMLElement>} onPick={pick} />
      </Suspense>}

      <div ref={scroller} tabIndex={-1} className="absolute inset-0 overflow-y-auto overflow-x-hidden outline-none">
        {/* 01 — Intro */}
        <section className="relative flex min-h-[130vh] flex-col justify-center px-6 pt-24 pb-[30vh] md:px-[8vw]">
          <p data-reveal className="reveal text-xs font-semibold tracking-[.3em] text-mint uppercase">01 — {s.introKicker}</p>
          <h2 data-reveal className="reveal mt-4 max-w-[14ch] text-[13vw] leading-[.9] font-black tracking-[-.04em] md:text-[7.5vw]">
            {s.introTitle}
          </h2>
          <p data-reveal className="reveal mt-8 max-w-xl text-lg text-paper/75 md:text-xl">{s.introText}</p>
          <p data-reveal className="reveal mt-6 max-w-xl font-mono text-sm text-paper/45">Electron · React · TypeScript · SQLite · Supabase · Node/Express · Railway · Vercel</p>
        </section>

        {/* 02 — Projects */}
        <section className="relative">
          <div className="px-6 md:px-[8vw]">
            <p data-reveal className="reveal text-xs font-semibold tracking-[.3em] text-mint uppercase">02 — {s.projectsKicker}</p>
            <h2 data-reveal className="reveal mt-4 text-[12vw] leading-[.9] font-black tracking-[-.04em] md:text-[6vw]">{s.projectsTitle}</h2>
          </div>
          <div ref={stage} style={{ height: `${N * 60 + 40}vh` }} className="relative">
            <div className="pointer-events-none sticky top-0 h-[100svh]">
              <article
                key={p.id}
                className="card-in pointer-events-auto absolute inset-x-4 bottom-[max(88px,calc(env(safe-area-inset-bottom)+80px))] rounded-2xl border border-paper/10 bg-ink/80 p-5 backdrop-blur-md md:inset-x-auto md:top-1/2 md:bottom-auto md:left-[6vw] md:w-[min(30vw,420px)] md:-translate-y-1/2 md:p-7"
              >
                {!webgl && <img src={`/projects/${p.id}.webp`} alt="" className="mb-4 w-full rounded-lg border border-paper/10" />}
                <p className="font-mono text-xs text-paper/50">{String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')} · {p.kind[lang]}</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight md:text-4xl">{p.name}</h3>
                <p className="mt-3 text-sm text-paper/80 md:text-base">{p.problem[lang]}</p>
                <ul className="mt-4 hidden flex-wrap gap-1.5 md:flex">
                  {p.stack.map(x => <li key={x} className="rounded-full border border-paper/15 px-2.5 py-1 text-xs text-paper/70">{x}</li>)}
                </ul>
                <div className="mt-5 flex items-center gap-2">
                  <button onClick={() => goTo(active - 1)} aria-label={s.prev} className="grid size-10 place-items-center rounded-full border border-paper/40 hover:bg-paper/10">←</button>
                  <button onClick={() => goTo(active + 1)} aria-label={s.next} className="grid size-10 place-items-center rounded-full bg-paper text-ink hover:bg-mint">→</button>
                  <button onClick={() => openDetail(p)} className="ml-auto h-10 rounded-full bg-mint px-4 text-sm font-bold text-ink">{s.details}</button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 03 — Skills: every skill links to the project that proves it */}
        <section ref={skills} className="relative px-6 pt-[18vh] pb-[12vh] md:px-[8vw]">
          <p data-reveal className="reveal text-xs font-semibold tracking-[.3em] text-mint uppercase">03 — {s.skillsKicker}</p>
          <h2 data-reveal className="reveal mt-4 text-[12vw] leading-[.9] font-black tracking-[-.04em] md:text-[6vw]">{s.skillsTitle}</h2>
          <p data-reveal className="reveal mt-5 max-w-xl text-paper/65 md:text-lg">{s.skillsIntro}</p>
          <div className="mt-14 grid gap-5 md:w-[56%]">
            {DOMAINS.map((d, di) => (
              <div
                key={d.id}
                data-domain={di}
                data-reveal
                className={`reveal rounded-2xl border bg-ink/75 p-5 backdrop-blur-md md:p-7 ${domain === di ? 'border-mint/50' : 'border-paper/10'}`}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-mint">{String(di + 1).padStart(2, '0')}</span>
                  <h3 className="text-2xl font-black tracking-tight md:text-4xl">{d.title[lang]}</h3>
                </div>
                <ul className="mt-4 divide-y divide-paper/10">
                  {d.skills.map(sk => (
                    <li key={sk.name.en} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                      <span className="font-semibold">{sk.name[lang]}</span>
                      {sk.project ? (
                        <button onClick={() => openDetail(PROJECTS.find(x => x.id === sk.project)!)} className="text-left text-sm text-mint underline-offset-4 hover:underline">
                          <span aria-hidden>↳ </span><span className="sr-only">{s.proof} : </span>{sk.proof[lang]}
                        </button>
                      ) : (
                        <span className="text-sm text-paper/50"><span aria-hidden>↳ </span>{sk.proof[lang]}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 04 — Contact */}
        <section ref={contact} className="relative flex min-h-[100svh] flex-col justify-center bg-gradient-to-b from-transparent via-ink/80 to-ink px-6 pb-24 md:px-[8vw]">
          <p data-reveal className="reveal text-xs font-semibold tracking-[.3em] text-mint uppercase">04 — Contact</p>
          <p data-reveal className="reveal mt-6 font-serif text-3xl text-mint italic md:text-5xl">{s.endKicker}</p>
          <h2 data-reveal className="reveal text-[18vw] leading-[.9] font-black tracking-[-.04em] md:text-[10vw]">{s.endTitle}</h2>
          <p data-reveal className="reveal mt-6 max-w-xl text-paper/70 md:text-lg">{s.contactText}</p>
          <div data-reveal className="reveal mt-10 grid max-w-2xl gap-3 md:grid-cols-2">
            <div className="flex overflow-hidden rounded-2xl bg-paper text-ink">
              <a href={`mailto:${CONTACT.email}`} className="flex-1 p-5 hover:bg-white">
                <span className="block text-xs font-semibold tracking-[.2em] uppercase opacity-60">Email</span>
                <span className="mt-1 block font-bold break-all">{CONTACT.email}</span>
              </a>
              <button onClick={copyEmail} className="border-l border-ink/10 px-4 text-sm font-semibold hover:bg-white" aria-live="polite">{copied ? s.copied : s.copy}</button>
            </div>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener" className="rounded-2xl bg-mint p-5 text-ink hover:brightness-110">
              <span className="block text-xs font-semibold tracking-[.2em] uppercase opacity-60">WhatsApp</span>
              <span className="mt-1 block font-bold">{CONTACT.phone}</span>
            </a>
          </div>
          <a href="#simple" className="mt-12 text-sm text-paper/50 underline underline-offset-4 hover:text-paper">{s.simple}</a>
        </section>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setDetail(null)}
        onClick={e => e.target === dialog.current && dialog.current.close()}
        className="m-auto max-h-[90svh] w-[min(1000px,94vw)] overflow-y-auto rounded-2xl border border-paper/10 bg-ink p-0 text-paper backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        {detail && (
          <div className="p-5 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-paper/50">{detail.kind[lang]}</p>
                <h3 className="mt-1 text-3xl font-black tracking-tight md:text-5xl">{detail.name}</h3>
              </div>
              <button autoFocus onClick={() => dialog.current?.close()} aria-label={s.close} className="grid size-10 shrink-0 place-items-center rounded-full border border-paper/30 hover:bg-paper/10">✕</button>
            </div>
            <p className="mt-4 max-w-2xl text-paper/80 md:text-lg">{detail.problem[lang]}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {detail.stack.map(x => <li key={x} className="rounded-full border border-paper/15 px-2.5 py-1 text-xs text-paper/70">{x}</li>)}
            </ul>
            {detail.links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {detail.links.map(l => <a key={l.url} href={l.url} target="_blank" rel="noopener" className="h-10 content-center rounded-full bg-mint px-4 text-sm font-bold text-ink">{l.label} ↗</a>)}
              </div>
            )}
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
              <img src={`/projects/${detail.id}.webp`} alt={`${detail.name} — ${s.shotDesktop}`} className="w-full rounded-lg border border-paper/10" loading="lazy" />
              {detail.links.length > 0 && <img src={`/projects/${detail.id}-m.webp`} alt={`${detail.name} — ${s.shotMobile}`} className="mx-auto max-h-[420px] rounded-lg border border-paper/10" loading="lazy" />}
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
