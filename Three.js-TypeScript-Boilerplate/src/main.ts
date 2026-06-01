import './style.css'
import * as THREE from 'three'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// import Stats from 'three/addons/libs/stats.module.js'
// import { GUI } from 'dat.gui'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x001a8c)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 1.5

const main = document.getElementById('main') as HTMLCanvasElement
const mainRenderer = new THREE.WebGLRenderer({ canvas: main })
mainRenderer.setSize(window.innerWidth, 0.9*window.innerHeight)
document.body.appendChild(mainRenderer.domElement)

const header = document.getElementById('header') as HTMLCanvasElement
const headerRenderer = new THREE.WebGLRenderer({ canvas: header })
headerRenderer.setSize(window.innerWidth, 0.1*window.innerHeight)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  mainRenderer.setSize(window.innerWidth, 0.9*window.innerHeight)
})

function animate() {
  requestAnimationFrame(animate)

  mainRenderer.render(scene, camera)
}

animate()