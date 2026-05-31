import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'dat.gui'

const scene = new THREE.Scene()

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

new OrbitControls(camera, renderer.domElement)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshNormalMaterial({ wireframe: true })

const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

const stats = new Stats()
// stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

const gui = new GUI()

const cubePosition = gui.addFolder('Cube_position')
cubePosition.add(cube.position, 'x', -5, 5).name('Position X')
cubePosition.add(cube.position, 'y', -5, 5).name('Position Y')
cubePosition.add(cube.position, 'z', -5, 5).name('Position Z')
const cubeRotation = gui.addFolder('cube_rotation')
cubeRotation.add(cube.rotation, 'x', 0, Math.PI * 2).name('Rotation X')
cubeRotation.add(cube.rotation, 'y', 0, Math.PI * 2).name('Rotation Y')
cubeRotation.add(cube.rotation, 'z', 0, Math.PI * 2).name('Rotation Z')
const cameraPosition = gui.addFolder('Camera_position')
cameraPosition.add(camera.position, 'x', -10, 10).name('Position X')
cameraPosition.add(camera.position, 'y', -10, 10).name('Position Y')
cameraPosition.add(camera.position, 'z', -10, 10).name('Position Z')
const cameraRotation = gui.addFolder('Camera_rotation')
cameraRotation.add(camera.rotation, 'x', 0, Math.PI * 2).name('Rotation X')
cameraRotation.add(camera.rotation, 'y', 0, Math.PI * 2).name('Rotation Y')
cameraRotation.add(camera.rotation, 'z', 0, Math.PI * 2).name('Rotation Z')
cameraRotation.open()
cameraPosition.open()
cubePosition.open()
cubeRotation.open()

function animate() {
  requestAnimationFrame(animate)

  // cube.rotation.x += 0.01
  // cube.rotation.y += 0.01

  renderer.render(scene, camera)

  stats.update()
}

animate()