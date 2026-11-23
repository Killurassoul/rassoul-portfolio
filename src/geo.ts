import * as THREE from 'three'

// Box with rounded corners in the XY plane, depth d along Z, centred on the origin.
// Replaces drei's RoundedBox so drei isn't bundled at all.
export function roundedSlab(w: number, h: number, d: number, r: number) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y)
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 6 })
  g.translate(0, 0, -d / 2)
  return g
}
