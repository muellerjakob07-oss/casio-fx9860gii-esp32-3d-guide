import * as THREE from 'three'
import type { Vec3 } from '../types'

/**
 * Creates a pre-allocated BufferGeometry for a smooth tubular wire that can
 * be updated in-place every animation frame with ZERO GC allocations.
 */
export function createDynamicTubeGeometry(
  tubularSegments: number,
  radialSegments: number,
): THREE.BufferGeometry {
  const vertexCount = (tubularSegments + 1) * (radialSegments + 1)
  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)
  const indices: number[] = []

  for (let i = 0; i <= tubularSegments; i++) {
    for (let j = 0; j <= radialSegments; j++) {
      const idx = i * (radialSegments + 1) + j
      uvs[idx * 2] = i / tubularSegments
      uvs[idx * 2 + 1] = j / radialSegments
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j
      const b = (i + 1) * (radialSegments + 1) + j
      const c = (i + 1) * (radialSegments + 1) + (j + 1)
      const d = i * (radialSegments + 1) + (j + 1)
      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

// Reusable scratch vectors to eliminate per-frame allocations
const _p = new THREE.Vector3()
const _t = new THREE.Vector3()
const _n = new THREE.Vector3()
const _b = new THREE.Vector3()
const _up = new THREE.Vector3(0, 1, 0)
const _altUp = new THREE.Vector3(1, 0, 0)
const _prevN = new THREE.Vector3()

/**
 * Updates a pre-allocated tube geometry along a CatmullRomCurve3 using stable
 * parallel-transport frames so wires never pinch or twist during animation.
 */
export function updateDynamicTubeGeometry(
  geo: THREE.BufferGeometry,
  curve: THREE.CatmullRomCurve3,
  tubularSegments: number,
  radius: number,
  radialSegments: number,
): void {
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
  const normAttr = geo.getAttribute('normal') as THREE.BufferAttribute
  const posArr = posAttr.array as Float32Array
  const normArr = normAttr.array as Float32Array

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments
    curve.getPointAt(u, _p)
    curve.getTangentAt(u, _t).normalize()

    if (i === 0) {
      const ref = Math.abs(_t.dot(_up)) > 0.92 ? _altUp : _up
      _n.crossVectors(ref, _t).normalize()
      _prevN.copy(_n)
    } else {
      // Parallel transport previous normal onto plane perpendicular to new tangent
      const dot = _prevN.dot(_t)
      _n.copy(_prevN).addScaledVector(_t, -dot)
      if (_n.lengthSq() < 1e-6) {
        const ref = Math.abs(_t.dot(_up)) > 0.92 ? _altUp : _up
        _n.crossVectors(ref, _t).normalize()
      } else {
        _n.normalize()
      }
      _prevN.copy(_n)
    }

    _b.crossVectors(_t, _n).normalize()

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2
      const sin = Math.sin(v)
      const cos = -Math.cos(v)

      const nx = cos * _n.x + sin * _b.x
      const ny = cos * _n.y + sin * _b.y
      const nz = cos * _n.z + sin * _b.z

      const idx = (i * (radialSegments + 1) + j) * 3
      normArr[idx] = nx
      normArr[idx + 1] = ny
      normArr[idx + 2] = nz

      posArr[idx] = _p.x + radius * nx
      posArr[idx + 1] = _p.y + radius * ny
      posArr[idx + 2] = _p.z + radius * nz
    }
  }

  posAttr.needsUpdate = true
  normAttr.needsUpdate = true
  geo.computeBoundingSphere()
}

/**
 * Helper to create a rounded rectangle THREE.Shape centered at (0, 0)
 */
export function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const s = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  const r = Math.min(radius, width / 2, height / 2)

  s.moveTo(x + r, y)
  s.lineTo(x + width - r, y)
  s.quadraticCurveTo(x + width, y, x + width, y + r)
  s.lineTo(x + width, y + height - r)
  s.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  s.lineTo(x + r, y + height)
  s.quadraticCurveTo(x, y + height, x, y + height - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/**
 * Helper to build a realistic helical conical battery spring TubeGeometry
 */
export function createBatterySpringGeometry(
  baseRadius = 3.8,
  tipRadius = 1.4,
  length = 4.6,
  turns = 4.5,
): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = []
  const samples = 64
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const angle = t * turns * Math.PI * 2
    const r = baseRadius + (tipRadius - baseRadius) * t
    pts.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, t * length))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  return new THREE.TubeGeometry(curve, 64, 0.34, 8, false)
}

export function vec3ToThree(v: Vec3, yOffset = 0): THREE.Vector3 {
  return new THREE.Vector3(v[0], v[1] + yOffset, v[2])
}
