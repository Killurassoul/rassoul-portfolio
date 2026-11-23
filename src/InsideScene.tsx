import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber'
import { roundedSlab } from './geo'
import { Suspense, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { PROJECTS } from './projects'

// Written by Inside.tsx on scroll, read here every frame (no React re-render per scroll tick)
export type ScrollState = { intro: number; enter: number; proj: number; skills: number; domain: number; contact: number }

type Props = { st: ScrollState; reduced: boolean; paused: boolean; eventSource: RefObject<HTMLElement>; onPick: (i: number) => void }

const N = PROJECTS.length
const STEP = (Math.PI * 2) / N
const SW = 2.4, SH = 1.5
const R = 3.2 / (2 * Math.sin(STEP / 2)) // neighbours sit ~0.8 units apart
const FRAME_GEO = roundedSlab(SW + 0.12, SH + 0.12, 0.06, 0.04)

function Particles({ reduced, st }: { reduced: boolean; st: ScrollState }) {
  const ref = useRef<THREE.Points>(null!)
  const geo = useMemo(() => {
    const p = new Float32Array(700 * 3)
    for (let i = 0; i < p.length; i++) p[i] = (Math.random() - 0.5) * (i % 3 === 2 ? 14 : 22)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [])
  useFrame(s => {
    const t = reduced ? 0 : s.clock.elapsedTime
    ref.current.rotation.y = t * 0.02 + st.intro * 0.6 + st.proj * 0.05
    ref.current.position.y = st.intro * 2
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.035} color="#7ef0c4" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// Intro: wireframe solids that drift up and away as you scroll into the projects
function Shapes({ reduced, st }: { reduced: boolean; st: ScrollState }) {
  const g = useRef<THREE.Group>(null!)
  const mats = useRef<THREE.MeshBasicMaterial[]>([])
  const items = [
    { geo: <icosahedronGeometry args={[1.1, 1]} />, pos: [-3.4, 0.8, -1], s: 1 },
    { geo: <torusGeometry args={[0.8, 0.22, 12, 48]} />, pos: [3.6, -0.6, -2], s: 1 },
    { geo: <octahedronGeometry args={[0.7, 0]} />, pos: [2.2, 2.1, -3], s: 1 },
  ] as const
  useFrame(s => {
    const t = reduced ? 0 : s.clock.elapsedTime
    g.current.position.y = st.intro * 5
    g.current.children.forEach((m, i) => {
      m.rotation.x = t * (0.15 + i * 0.05) + st.intro * 2
      m.rotation.y = t * (0.1 + i * 0.04)
    })
    mats.current.forEach(m => (m.opacity = 0.5 * (1 - st.enter)))
  })
  return (
    <group ref={g}>
      {items.map((it, i) => (
        <mesh key={i} position={it.pos as unknown as [number, number, number]}>
          {it.geo}
          <meshBasicMaterial ref={m => { if (m) mats.current[i] = m }} color="#7ef0c4" wireframe transparent />
        </mesh>
      ))}
    </group>
  )
}

function Ring({ reduced, st, onPick }: { reduced: boolean; st: ScrollState; onPick: (i: number) => void }) {
  const textures = useLoader(THREE.TextureLoader, PROJECTS.map(p => `/projects/${p.id}.webp`))
  textures.forEach(t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4 })
  const ring = useRef<THREE.Group>(null!)
  const mats = useRef<THREE.MeshBasicMaterial[]>([])
  const cur = useRef(0)
  const { size } = useThree()
  const portrait = size.width / size.height < 0.9

  useFrame((_, dt) => {
    cur.current += (st.proj - cur.current) * (reduced ? 1 : Math.min(1, dt * 5))
    ring.current.rotation.y = -cur.current * STEP
    const rise = 1 - st.enter
    ring.current.position.set(portrait ? 0 : 1.25, (portrait ? 1.05 : -0.1) - rise * 10 + st.skills * 10, -R)
    mats.current.forEach((m, i) => {
      let d = Math.abs(i - cur.current) % N
      d = Math.min(d, N - d)
      m.color.setScalar(1 - Math.min(1, d) * 0.65)
    })
  })

  const click = (i: number) => (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPick(i) }
  const cursor = (on: boolean) => () => { document.body.style.cursor = on ? 'pointer' : '' }

  return (
    <group ref={ring} rotation-x={0.06}>
      {PROJECTS.map((p, i) => {
        const a = i * STEP
        return (
          <group key={p.id} position={[Math.sin(a) * R, 0, Math.cos(a) * R]} rotation-y={a} onClick={click(i)} onPointerOver={cursor(true)} onPointerOut={cursor(false)}>
            <mesh geometry={FRAME_GEO} position-z={-0.035}>
              <meshStandardMaterial color="#1c2127" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh>
              <planeGeometry args={[SW, SH]} />
              <meshBasicMaterial ref={m => { if (m) mats.current[i] = m }} map={textures[i]} toneMapped={false} />
            </mesh>
            <mesh position={[0, -SH / 2 - 0.25, -0.3]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[SW * 0.9, 0.5]} />
              <meshBasicMaterial color={p.accent} transparent opacity={0.12} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// Skills: one node per domain around a core; the active domain swings to the top and grows
const D = 5
function Constellation({ reduced, st }: { reduced: boolean; st: ScrollState }) {
  const g = useRef<THREE.Group>(null!)
  const nodes = useRef<THREE.Mesh[]>([])
  const rot = useRef(0)
  const { size } = useThree()
  const portrait = size.width / size.height < 0.9
  const lines = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i < D; i++) {
      const a = (i / D) * Math.PI * 2, b = ((i + 1) / D) * Math.PI * 2
      pts.push(0, 0, 0, Math.sin(a) * 1.7, Math.cos(a) * 1.7, 0)
      pts.push(Math.sin(a) * 1.7, Math.cos(a) * 1.7, 0, Math.sin(b) * 1.7, Math.cos(b) * 1.7, 0)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [])
  useFrame((s, dt) => {
    const k = reduced ? 1 : Math.min(1, dt * 4)
    rot.current += ((st.domain / D) * Math.PI * 2 - rot.current) * k
    const t = reduced ? 0 : s.clock.elapsedTime
    g.current.rotation.set(Math.sin(t * 0.3) * 0.25, Math.cos(t * 0.25) * 0.3, rot.current)
    g.current.position.set(portrait ? 0.4 : 2.7, (portrait ? -1.2 : -0.25) - (1 - st.skills) * 9 + st.contact * 9, -1)
    g.current.scale.setScalar(portrait ? 0.6 : 0.8)
    nodes.current.forEach((m, i) => {
      const on = i === st.domain
      m.scale.lerp(new THREE.Vector3().setScalar(on ? 1.6 : 1), k)
      ;(m.material as THREE.MeshBasicMaterial).color.set(on ? '#ffffff' : '#7ef0c4')
    })
  })
  return (
    <group ref={g}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#7ef0c4" transparent opacity={0.3} />
      </lineSegments>
      <mesh>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshBasicMaterial color="#7ef0c4" wireframe />
      </mesh>
      {Array.from({ length: D }, (_, i) => {
        const a = (i / D) * Math.PI * 2
        return (
          <mesh key={i} ref={m => { if (m) nodes.current[i] = m }} position={[Math.sin(a) * 1.7, Math.cos(a) * 1.7, 0]}>
            <icosahedronGeometry args={[0.13, 2]} />
            <meshBasicMaterial color="#7ef0c4" />
          </mesh>
        )
      })}
    </group>
  )
}

function Rig({ reduced }: { reduced: boolean }) {
  const { camera, pointer, size } = useThree()
  const portrait = size.width / size.height < 0.9
  useFrame((_, dt) => {
    const k = reduced ? 0 : 1
    const z = portrait ? 10.5 : 6.2
    camera.position.x += (pointer.x * 0.5 * k - camera.position.x) * Math.min(1, dt * 2)
    camera.position.y += (pointer.y * 0.3 * k - camera.position.y) * Math.min(1, dt * 2)
    camera.position.z = z
    camera.lookAt(0, portrait ? 0.4 : 0, -R)
  })
  return null
}

export default function InsideScene({ st, reduced, paused, eventSource, onPick }: Props) {
  return (
    <Canvas
      className="!fixed inset-0"
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.75]}
      camera={{ fov: 35, near: 0.1, far: 60, position: [0, 0, 6.2] }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Rig reduced={reduced} />
      <Particles reduced={reduced} st={st} />
      <Shapes reduced={reduced} st={st} />
      <Constellation reduced={reduced} st={st} />
      <Suspense fallback={null}>
        <Ring reduced={reduced} st={st} onPick={onPick} />
      </Suspense>
    </Canvas>
  )
}
