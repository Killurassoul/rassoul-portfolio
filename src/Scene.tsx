import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber'
import { roundedSlab } from './geo'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

export type ScenePhase = 'hero' | 'opening' | 'inside' | 'closing'
type Props = { phase: ScenePhase; reduced: boolean; paused?: boolean; onOpenRequest: () => void; onDone: () => void; onReady: () => void }

// Laptop dimensions (world units)
const W = 1.7, D = 1.12, BT = 0.06, LT = 0.035
const TAU = Math.PI * 2
const BASE_GEO = roundedSlab(W, D, BT, 0.03).rotateX(-Math.PI / 2)
const LID_GEO = roundedSlab(W, D, LT, 0.03)

// Hero pose: closed laptop held in front of the chest, logo facing the viewer
const HERO = {
  laptopPos: [0, -1.08, 1.15] as const,
  laptopRot: [1.12, -0.42 - TAU, 0.06] as const, // -TAU so the turn to 0 is a full spin
  lid: Math.PI / 2 - 0.02,
}
const OPEN = { laptopPos: [0, -0.6, 1.7] as const, laptopRot: [0.14, 0, 0] as const, lid: -0.2 }

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const el = document.createElement('canvas')
  el.width = w; el.height = h
  draw(el.getContext('2d')!)
  const tex = new THREE.CanvasTexture(el)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function useTextures() {
  return useMemo(() => {
    const screen = canvasTex(1024, 640, c => {
      const g = c.createLinearGradient(0, 0, 0, 640)
      g.addColorStop(0, '#0d1714'); g.addColorStop(1, '#07090b')
      c.fillStyle = g; c.fillRect(0, 0, 1024, 640)
      const r = c.createRadialGradient(512, 330, 10, 512, 330, 420)
      r.addColorStop(0, 'rgba(126,240,196,.22)'); r.addColorStop(1, 'rgba(126,240,196,0)')
      c.fillStyle = r; c.fillRect(0, 0, 1024, 640)
      c.fillStyle = '#f3f1ea'; c.textAlign = 'center'
      c.font = '900 120px "Inter Tight", sans-serif'; c.fillText('RASSOUL', 512, 340)
      c.fillStyle = '#7ef0c4'; c.font = 'italic 48px "Instrument Serif", serif'; c.fillText('full-stack × IA', 512, 410)
      c.textAlign = 'left'; c.font = '20px monospace'; c.fillStyle = 'rgba(243,241,234,.35)'
      ;['> electron · react · typescript', '> supabase · sqlite · node', '> claude · gemini · whatsapp'].forEach((l, i) => c.fillText(l, 60, 520 + i * 30))
    })
    const logo = canvasTex(512, 340, c => {
      c.fillStyle = '#23272d'; c.fillRect(0, 0, 512, 340)
      c.shadowColor = '#7ef0c4'; c.shadowBlur = 30
      c.fillStyle = '#7ef0c4'; c.textAlign = 'center'
      c.font = 'italic 150px "Instrument Serif", serif'; c.fillText('R', 256, 215)
    })
    const keys = canvasTex(1024, 512, c => {
      c.fillStyle = '#16191d'; c.fillRect(0, 0, 1024, 512)
      c.fillStyle = '#2b3037'
      for (let row = 0; row < 5; row++) for (let k = 0; k < 14; k++) {
        c.beginPath(); c.roundRect(40 + k * 68, 30 + row * 52, 58, 44, 6); c.fill()
      }
      c.beginPath(); c.roundRect(340, 320, 344, 170, 12); c.fillStyle = '#20242a'; c.fill()
    })
    const glow = canvasTex(256, 256, c => {
      const r = c.createRadialGradient(128, 128, 0, 128, 128, 128)
      r.addColorStop(0, 'rgba(126,240,196,.55)'); r.addColorStop(1, 'rgba(126,240,196,0)')
      c.fillStyle = r; c.fillRect(0, 0, 256, 256)
    })
    // Fades the photo's flat-cut bottom and side edges (alphaMap reads the green channel)
    const fade = canvasTex(64, 256, c => {
      const g = c.createLinearGradient(0, 0, 0, 256)
      g.addColorStop(0, '#fff'); g.addColorStop(0.72, '#fff'); g.addColorStop(1, '#000')
      c.fillStyle = g; c.fillRect(0, 0, 64, 256)
      const h = c.createLinearGradient(0, 0, 64, 0)
      h.addColorStop(0, '#000'); h.addColorStop(0.12, 'rgba(0,0,0,0)'); h.addColorStop(0.88, 'rgba(0,0,0,0)'); h.addColorStop(1, '#000')
      c.fillStyle = h; c.fillRect(0, 160, 64, 96)
    })
    fade.colorSpace = THREE.NoColorSpace
    return { screen, logo, keys, glow, fade }
  }, [])
}

function World({ phase, reduced, onOpenRequest, onDone, onReady }: Props) {
  const { camera, pointer, size } = useThree()
  const photo = useLoader(THREE.TextureLoader, '/rassoul.webp')
  photo.colorSpace = THREE.SRGBColorSpace
  const tex = useTextures()

  const root = useRef<THREE.Group>(null!)
  const laptop = useRef<THREE.Group>(null!)
  const lid = useRef<THREE.Group>(null!)
  const screen = useRef<THREE.Mesh>(null!)
  const photoMat = useRef<THREE.MeshBasicMaterial>(null!)
  const screenMat = useRef<THREE.MeshBasicMaterial>(null!)

  const portrait = size.width / size.height < 0.8
  const camZ = portrait ? 8.2 : 6.2
  // Portrait: aim higher so the subject sits lower, leaving room for the wordmark and copy
  const home = { x: 0, y: portrait ? 0.5 : 0, z: camZ, lx: 0, ly: portrait ? 0.35 : -0.15, lz: 0 }
  const rig = useRef({ ...home, par: 1 }).current
  const smooth = useRef({ x: 0, y: 0 }).current
  const gyro = useRef({ x: 0, y: 0 }).current

  // Gyroscope parallax on phones (Android; iOS would need a permission prompt)
  useEffect(() => {
    const on = (e: DeviceOrientationEvent) => {
      gyro.x = THREE.MathUtils.clamp((e.gamma ?? 0) / 30, -1, 1)
      gyro.y = THREE.MathUtils.clamp(((e.beta ?? 45) - 45) / 30, -1, 1)
    }
    window.addEventListener('deviceorientation', on)
    return () => window.removeEventListener('deviceorientation', on)
  }, [gyro])

  useEffect(() => { if (phase === 'hero') Object.assign(rig, home) }, [portrait, camZ, phase]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(onReady, []) // eslint-disable-line react-hooks/exhaustive-deps -- mounts once the photo texture resolved

  useFrame((s, dt) => {
    const k = Math.min(1, dt * 3)
    const still = reduced ? 0 : 1
    smooth.x += ((pointer.x + gyro.x) - smooth.x) * k
    smooth.y += ((pointer.y - gyro.y) - smooth.y) * k
    const p = rig.par * still
    camera.position.set(rig.x + smooth.x * 0.45 * p, rig.y + smooth.y * 0.25 * p, rig.z)
    camera.lookAt(rig.lx, rig.ly, rig.lz)
    const t = s.clock.elapsedTime
    root.current.position.y = Math.sin(t * 1.1) * 0.03 * p // breathing
    if (phase === 'hero') laptop.current.rotation.z = HERO.laptopRot[2] + Math.sin(t * 0.9) * 0.025 * still
  })

  // Opening / closing timelines
  useEffect(() => {
    if (phase !== 'opening' && phase !== 'closing') return
    const L = laptop.current, Lid = lid.current, sm = screenMat.current, pm = photoMat.current
    const dur = reduced ? 0 : 1

    if (phase === 'closing') {
      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut', duration: 1.1 * dur }, onComplete: () => { L.rotation.y -= TAU; onDone() } })
      tl.to(rig, { ...home, par: 1 }, 0)
        .to(pm, { opacity: 1 }, 0.2 * dur)
        .to(sm.color, { r: 0.05, g: 0.05, b: 0.05 }, 0)
        .to(Lid.rotation, { x: HERO.lid }, 0.4 * dur)
        .to(L.position, { x: HERO.laptopPos[0], y: HERO.laptopPos[1], z: HERO.laptopPos[2] }, 0.5 * dur)
        .to(L.rotation, { x: HERO.laptopRot[0], y: HERO.laptopRot[1] + TAU, z: HERO.laptopRot[2] }, 0.5 * dur)
      return () => { tl.kill() }
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
    tl.to(rig, { par: 0, duration: 0.5 * dur }, 0)
      .to(L.position, { x: OPEN.laptopPos[0], y: OPEN.laptopPos[1], z: OPEN.laptopPos[2], duration: 1.3 * dur }, 0)
      .to(L.rotation, { x: OPEN.laptopRot[0], y: 0, z: 0, duration: 1.3 * dur }, 0)
      .to(Lid.rotation, { x: OPEN.lid, duration: 1.0 * dur, ease: 'power2.out' }, 0.75 * dur)
      .to(sm.color, { r: 1, g: 1, b: 1, duration: 0.5 * dur }, 1.45 * dur)
      .to(pm, { opacity: 0, duration: 0.7 * dur }, 1.5 * dur)
      .add(() => {
        // Dive: aim at the screen centre, then push the camera through it along its normal
        const c = new THREE.Vector3(), q = new THREE.Quaternion()
        screen.current.getWorldPosition(c)
        const n = new THREE.Vector3(0, 0, 1).applyQuaternion(screen.current.getWorldQuaternion(q))
        const at = (d: number) => ({ x: c.x + n.x * d, y: c.y + n.y * d, z: c.z + n.z * d })
        gsap.timeline({ onComplete: onDone })
          .to(rig, { lx: c.x, ly: c.y, lz: c.z, ...at(2.1), duration: 0.8 * dur, ease: 'power2.inOut' })
          .to(rig, { ...at(0.04), duration: 0.9 * dur, ease: 'power3.in' })
      }, 1.85 * dur)
    return () => { tl.kill() }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const hover = (on: boolean) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (phase === 'hero') document.body.style.cursor = on ? 'pointer' : ''
  }
  const photoH = 3.45

  return (
    <group ref={root}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 4]} intensity={1.6} />
      <pointLight position={[-2.5, 0.5, 2]} intensity={6} color="#7ef0c4" />

      <mesh position={[0, -0.1, -0.6]} scale={5.5}>
        <planeGeometry />
        <meshBasicMaterial map={tex.glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh position={[0, -1.95 + photoH / 2, 0]}>
        <planeGeometry args={[photoH * (499 / 809), photoH]} />
        <meshBasicMaterial ref={photoMat} map={photo} alphaMap={tex.fade} transparent toneMapped={false} />
      </mesh>

      <group
        ref={laptop}
        position={HERO.laptopPos}
        rotation={HERO.laptopRot}
        onClick={e => { e.stopPropagation(); if (phase === 'hero') { document.body.style.cursor = ''; onOpenRequest() } }}
        onPointerOver={hover(true)}
        onPointerOut={hover(false)}
      >
        {/* base */}
        <mesh geometry={BASE_GEO}>
          <meshStandardMaterial color="#2a2f36" metalness={0.55} roughness={0.38} />
        </mesh>
        <mesh position={[0, BT / 2 + 0.001, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.12, D - 0.12]} />
          <meshStandardMaterial map={tex.keys} roughness={0.8} />
        </mesh>
        {/* lid, pivoting on the back edge */}
        <group ref={lid} position={[0, BT / 2, -D / 2 + 0.02]} rotation={[HERO.lid, 0, 0]}>
          <mesh geometry={LID_GEO} position={[0, D / 2, 0]}>
            <meshStandardMaterial color="#2a2f36" metalness={0.55} roughness={0.38} />
          </mesh>
          <mesh ref={screen} position={[0, D / 2 + 0.01, LT / 2 + 0.001]}>
            <planeGeometry args={[W - 0.1, D - 0.12]} />
            <meshBasicMaterial ref={screenMat} map={tex.screen} color="#0d0d0d" toneMapped={false} />
          </mesh>
          <mesh position={[0, D / 2, -LT / 2 - 0.001]} rotation={[0, Math.PI, Math.PI]}>
            <planeGeometry args={[0.5, 0.33]} />
            <meshBasicMaterial map={tex.logo} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export default function Scene(props: Props) {
  return (
    <Canvas
      className="!fixed inset-0"
      frameloop={props.paused ? 'never' : 'always'}
      dpr={[1, 1.75]}
      camera={{ fov: 35, near: 0.01, far: 50, position: [0, 0, 6.2] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <World {...props} />
      </Suspense>
    </Canvas>
  )
}
