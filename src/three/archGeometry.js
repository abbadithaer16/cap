import * as THREE from 'three'
import { BASE, LEFT_DOOR, RISE, SPAN, X0 } from '../lib/arches'

function toShape(cmds, width, height, mirror = false) {
  const sx = width / SPAN
  const sy = height / RISE
  const map = (x, y) => [((mirror ? 2 * X0 - x : x) - X0) * sx, (BASE - y) * sy]
  const shape = new THREE.Shape()
  for (const [cmd, ...n] of cmds) {
    if (cmd === 'M') shape.moveTo(...map(n[0], n[1]))
    else if (cmd === 'L') shape.lineTo(...map(n[0], n[1]))
    else if (cmd === 'C')
      shape.bezierCurveTo(...map(n[0], n[1]), ...map(n[2], n[3]), ...map(n[4], n[5]))
  }
  shape.closePath()
  return shape
}

function extrude(shape, depth) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    curveSegments: 40,
    bevelEnabled: true,
    bevelThickness: depth * 0.12,
    bevelSize: depth * 0.08,
    bevelSegments: 4,
  })
  geo.translate(0, 0, -depth / 2)
  geo.computeVertexNormals()
  return geo
}

/** The two halves of the M as door geometry, origin at the floor centre. */
export function archDoorGeometries(width, height, depth) {
  const left = extrude(toShape(LEFT_DOOR, width, height), depth)
  const right = extrude(toShape(LEFT_DOOR, width, height, true), depth)
  return { left, right }
}
