import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { CameraTarget } from '../types'

interface CameraRigProps {
  cameraGoal: CameraTarget
  flightNonce: number
}

const _desiredPos = new THREE.Vector3()
const _desiredTarget = new THREE.Vector3()

export function CameraRig({ cameraGoal, flightNonce }: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const isFlyingRef = useRef(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    _desiredPos.set(...cameraGoal.position)
    _desiredTarget.set(...cameraGoal.target)
    if (!initializedRef.current && controlsRef.current) {
      controlsRef.current.target.copy(_desiredTarget)
      controlsRef.current.update()
      initializedRef.current = true
    }
    isFlyingRef.current = true
  }, [cameraGoal, flightNonce])

  useFrame((state, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    const { camera } = state
    const dt = Math.min(delta, 0.05)

    if (isFlyingRef.current) {
      const smooth = 4.2
      camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredPos.x, smooth, dt)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredPos.y, smooth, dt)
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredPos.z, smooth, dt)

      controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, smooth, dt)
      controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, smooth, dt)
      controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, smooth, dt)

      if (camera instanceof THREE.PerspectiveCamera && cameraGoal.fov) {
        camera.fov = THREE.MathUtils.damp(camera.fov, cameraGoal.fov, smooth, dt)
        camera.updateProjectionMatrix()
      }

      const posDist = camera.position.distanceTo(_desiredPos)
      const targetDist = controls.target.distanceTo(_desiredTarget)
      if (posDist < 0.25 && targetDist < 0.2) {
        isFlyingRef.current = false
      }
    }

    controls.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.75}
      zoomSpeed={0.95}
      panSpeed={0.8}
      minDistance={18}
      maxDistance={460}
      onStart={() => {
        // Immediately hand full manual control to the user when they drag or scroll
        isFlyingRef.current = false
      }}
    />
  )
}
