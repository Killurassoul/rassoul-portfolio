import { lazy, Suspense, useEffect, useState } from 'react'
import { t, CONTACT, type Lang } from './i18n'
import type { ScenePhase } from './Scene'
import Inside from './Inside'
import Simple from './Simple'

const Scene = lazy(() => import('./Scene'))

// 3D only on a real GPU: software renderers and low-memory phones get the 2D version (?3d forces, ?lite disables)
function hasWebGL() {
  const q = new URLSearchParams(location.search)
  if (q.has('lite')) return false
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    if (!gl) return false
    if (q.has('3d')) return true
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return false
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    return !(mem && mem < 2)
  } catch { return false }
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('fr') ? 'fr' : 'en'))
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [phase, setPhase] = useState<ScenePhase>('hero')
  const [fontsReady, setFontsReady] = useState(false)
  const [ready, setReady] = useState(false)
  const [load3d, setLoad3d] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [pendingOpen, setPendingOpen] = useState(false)
  const [webgl] = useState(hasWebGL)
  const [contactOpen, setContactOpen] = useState(false)
  const [simple, setSimple] = useState(() => location.hash === '#simple')
  const [insideMounted, setInsideMounted] = useState(false)
  const s = t[lang]

  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => {
    const h = () => setSimple(location.hash === '#simple')
    addEventListener('hashchange', h)
    return () => removeEventListener('hashchange', h)
  }, [])
  // Mount the inside view as soon as the dive starts so its textures load during the animation
  useEffect(() => { if (phase !== 'hero') setInsideMounted(true) }, [phase])
  // The 3D screen texture draws text, so fonts must be in before the scene mounts (capped at 2.5 s)
  useEffect(() => {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]).then(() => setFontsReady(true))
  }, [])
  // Progressive: the static photo paints at once, the copy once fonts are in, and the heavy 3D
  // only on first interaction (or after 4 s) so it never competes with the first paint on weak phones
  useEffect(() => { if (fontsReady) setReady(true) }, [fontsReady])
  useEffect(() => {
    if (!webgl || !fontsReady) return
    const go = () => setLoad3d(true)
    const evs = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel'] as const
    evs.forEach(e => addEventListener(e, go, { once: true, passive: true }))
    const t = setTimeout(go, 4000)
    return () => { clearTimeout(t); evs.forEach(e => removeEventListener(e, go)) }
  }, [webgl, fontsReady])

  const has3d = webgl && sceneReady
  const open = () => {
    if (phase !== 'hero') return
    if (webgl && !sceneReady) { setLoad3d(true); setPendingOpen(true); return } // play the dive once 3D is up
    setPhase(has3d ? 'opening' : 'inside')
  }
  useEffect(() => {
    if (!pendingOpen) return
    if (sceneReady) { setPendingOpen(false); setPhase('opening'); return }
    const t = setTimeout(() => { setPendingOpen(false); setPhase('inside') }, 6000) // 3D never came: skip the dive
    return () => clearTimeout(t)
  }, [pendingOpen, sceneReady])
  const back = () => phase === 'inside' && setPhase(has3d ? 'closing' : 'hero')
  const onDone = () => setPhase(p => (p === 'opening' ? 'inside' : 'hero'))

  // Keyboard: on the hero Enter/Space/↓ opens; inside, Escape goes back (arrows scroll natively)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (simple || document.querySelector('dialog[open]') || (e.target as HTMLElement).closest('button, a')) return
      if (phase === 'hero' && ['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); open() }
      if (e.key === 'Escape') back()
    }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  })

  const heroVisible = phase === 'hero'
  if (simple) return <Simple lang={lang} setLang={setLang} />

  return (
    <main className={`stage-bg fixed inset-0 overflow-hidden ${reduced ? 'reduced' : ''}`}>
      {/* Wordmark behind the 3D layer */}
      <div className={`pointer-events-none absolute inset-x-0 top-[9vh] select-none text-center transition-all duration-500 md:top-[6vh] ${heroVisible ? 'opacity-100' : '-translate-y-10 opacity-0'}`}>
        {ready && <h1 className="wordmark anim-rise text-[22vw] leading-[.85] font-black tracking-[-.04em] md:text-[19vw]">RASSOUL</h1>}
      </div>

      {load3d && (
        <Suspense fallback={null}>
          <Scene phase={phase} reduced={reduced} paused={phase === 'inside'} onOpenRequest={open} onDone={onDone} onReady={() => setSceneReady(true)} />
        </Suspense>
      )}
      {/* Static stand-in matching the 3D photo plane's framing; fades out once the 3D scene is up */}
      {(
        <img
          src="/rassoul.webp"
          alt=""
          className={`pointer-events-none absolute top-[11.6%] left-1/2 h-[88.2%] -translate-x-1/2 object-contain transition-opacity duration-700 [@media(max-aspect-ratio:4/5)]:top-[28.7%] [@media(max-aspect-ratio:4/5)]:h-[66.7%] ${has3d || phase !== 'hero' ? 'opacity-0' : 'opacity-100'}`}
          style={{ maskImage: 'linear-gradient(180deg,#000 72%,transparent)', WebkitMaskImage: 'linear-gradient(180deg,#000 72%,transparent)' }}
        />
      )}

      {/* Hero copy above the 3D layer */}
      {ready && (
        <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="anim-write absolute top-[calc(9vh+15vw)] left-[5vw] -rotate-6 font-serif text-[9vw] italic text-mint drop-shadow-lg md:top-[15vw] md:left-[8vw] md:text-[5.5vw]">{s.script}</p>
          <div className="anim-fade absolute top-[calc(9vh+27vw)] left-[6vw] max-w-[42vw] text-xs md:top-[23vw] md:left-[8.5vw] md:max-w-[22vw] md:text-lg">
            <p className="font-semibold">{s.role}</p>
            <p className="mt-1 text-paper/60">{s.base}</p>
          </div>
          <button
            onClick={open}
            tabIndex={heroVisible ? 0 : -1}
            className="anim-fade pointer-events-auto absolute bottom-[calc(76px+env(safe-area-inset-bottom))] left-4 flex items-center md:bottom-[22px] md:left-1/2 md:-translate-x-1/2 gap-3 text-xs font-semibold tracking-[.18em] uppercase opacity-90 hover:text-mint"
          >
            <span className="drip relative h-6 w-px overflow-hidden bg-paper/30" />
            {pendingOpen ? s.loading + '…' : has3d ? s.hint : s.open}
            <span className="sr-only">— {s.open}</span>
          </button>
          {!webgl && <p className="absolute right-4 bottom-[calc(110px+env(safe-area-inset-bottom))] left-4 text-center text-xs text-paper/60 md:bottom-16">{s.lite}</p>}
        </div>
      )}

      {insideMounted && <Inside lang={lang} reduced={reduced} visible={phase === 'inside'} webgl={webgl} />}

      {/* Top bar */}
      <nav className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3 md:p-5">
        <button onClick={back} className="tag h-9 px-4 text-sm font-semibold">Rassoul</button>
        <div className="flex gap-2">
          <a href="#simple" className="tag flex h-9 items-center px-3 text-sm font-semibold">{s.simpleNav}</a>
          <button onClick={() => setReduced(r => !r)} aria-pressed={reduced} title={s.reduce} className="tag h-9 px-3 text-sm font-semibold">
            <span className="hidden md:inline">{reduced ? s.motionOff : s.motionOn}</span>
            <span className="md:hidden" aria-hidden>{reduced ? '◼' : '▶'}</span>
            <span className="sr-only md:hidden">{reduced ? s.motionOff : s.motionOn}</span>
          </button>
          <button onClick={() => setLang(l => (l === 'fr' ? 'en' : 'fr'))} className="tag h-9 px-3 text-sm font-semibold" aria-label={lang === 'fr' ? 'EN — Switch to English' : 'FR — Passer en français'}>
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </nav>

      {/* Contact, always visible */}
      <div className="absolute right-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-10 flex flex-col items-end gap-2 md:right-5 md:bottom-5">
        {contactOpen && (
          <div className="flex flex-col gap-2" id="contact-menu">
            <a className="tag flex h-10 items-center px-4 text-sm font-semibold" href={`mailto:${CONTACT.email}`}>✉ {CONTACT.email}</a>
            <a className="tag flex h-10 items-center px-4 text-sm font-semibold" href={CONTACT.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
          </div>
        )}
        <button onClick={() => setContactOpen(o => !o)} aria-expanded={contactOpen} aria-controls="contact-menu" className="h-11 rounded-full bg-mint px-5 text-sm font-bold text-ink shadow-lg shadow-mint/20 transition-transform hover:scale-105">
          {s.contact}
        </button>
      </div>

      {/* Loader */}
      <div aria-live="polite" className={`absolute inset-0 grid place-items-center bg-ink transition-opacity duration-700 ${ready ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
        <div className="text-center">
          <p className="text-3xl font-black tracking-[.2em]">RASSOUL</p>
          <div className="slide relative mx-auto mt-4 h-px w-40 overflow-hidden bg-paper/20" />
          <p className="mt-3 text-xs tracking-[.3em] text-paper/50 uppercase">{s.loading}</p>
        </div>
      </div>
    </main>
  )
}
