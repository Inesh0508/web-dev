import './style.css'
import * as THREE from 'three'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// import Stats from 'three/addons/libs/stats.module.js'
// import { GUI } from 'dat.gui'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x112266)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 1.5

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function animate() {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)
}

animate()