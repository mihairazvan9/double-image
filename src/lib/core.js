import { range } from './utils'
import { bg1, bg2, blob  } from './loader'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'

// NOTE: Core settings variables
let camera, aspect, scene, scene1,
    renderer, rendererTarget, controls,
    bgMesh, mesh, material, materialBG, blobs = [],
    time = 0

// NOTE: Mouse variables
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const point = new THREE.Vector3()

function init (canvas_id) {
  // NOTE: Camera params.
  let fov = 70
  let near_plane = 0.1
  let far_plane = 2000

  scene = new THREE.Scene()
  scene1 = new THREE.Scene()
  // scene.background = bg_gradient
  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    near_plane,
    far_plane
  )
  camera.position.z = 2.5

  let frustumSize = 1;
  aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(frustumSize / -2, frustumSize / 2, frustumSize / 2, frustumSize / -2, -1000, 1000);
  // NOTE: Specify a canvas which is already created in the HTML.
  const canvas = document.getElementById(canvas_id)

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true
  })

  renderer.outputEncoding = THREE.sRGBEncoding  // NOTE: Comment if we need bloomPass
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.physicallyCorrectLights = true
  document.body.appendChild(renderer.domElement)
  // controls = new OrbitControls(camera, renderer.domElement)
  // controls.movementSpeed = 150
  // controls.rotateSpeed = 0.2
  // controls.enableZoom = false
  // controls.enablePan = false
  // controls.lookSpeed = 0.1

  rendererTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {})
  add_mesh()
  add_blobs()
  add_reycaster_event()
  window.addEventListener('resize', () => onWindowResize(), false)
}

function add_mesh () {
  let video = document.getElementById('video')
  video.play()
  const geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 )
  material = new THREE.ShaderMaterial({
    fragmentShader: fragment,
    vertexShader: vertex,
    uniforms: {
      progress: { type: 'f', value: 0 },
      mask: { value: blob },
      bg: { value: bg1 },
      // bg: { value: new THREE.VideoTexture(video) },
      resolution: { value: new THREE.Vector4() }
    },
    side: THREE.DoubleSide,
    transparent: true
  })
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  mesh.position.z = 0.01


  let fragmentShader = `
          uniform sampler2D bg;
          uniform vec4 resolution;
          varying vec2 vUv;
          void main() {
            vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
            vec4 t = texture2D(bg, newUV);
            gl_FragColor = vec4(newUV, 0., 1.);
            gl_FragColor = t;
          }
        `

  materialBG = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      bg: { value: new THREE.VideoTexture(video) },
      resolution: {
        value: new THREE.Vector4()
      },
    },
    vertexShader: vertex,
    fragmentShader
  });
  let geometryBG = new THREE.PlaneGeometry(1, 1, 1, 1);
  let planeBG = new THREE.Mesh(geometryBG, materialBG);
  scene.add(planeBG);


  // bgMesh = new THREE.Mesh(
  //   new THREE.PlaneGeometry(1, 1, 1, 1),
  //   new THREE.MeshBasicMaterial({
  //     map: new THREE.VideoTexture(video),
  //     // map: bg1,
  //     side: THREE.DoubleSide
  //   })
  // )
  // scene.add(bgMesh)
  set_object_size()
}

function render () {
  renderer.render(scene, camera)
}

function onWindowResize () {

  camera.aspect = window.innerWidth / window.innerHeight
  renderer.setSize(window.innerWidth, window.innerHeight)

  set_object_size()
  camera.updateProjectionMatrix();
}

function set_object_size () {
  let canvas = document.getElementById('canvas-imr-app')
  let width = window.innerWidth
  let height = window.innerHeight
  // image cover
  let imageAspect = 1. / 1.5
  let a1
  let a2
  if (height / width > imageAspect) {
    a1 = (width / height) * imageAspect
    a2 = 1
  } else {
    a1 = 1
    a2 = (height / width) / imageAspect
  }
  material.uniforms.resolution.value.x = width
  material.uniforms.resolution.value.y = height
  material.uniforms.resolution.value.z = a1
  material.uniforms.resolution.value.w = a2

  materialBG.uniforms.resolution.value.copy(material.uniforms.resolution.value)
}

function add_blobs () {
  let nr = 50

  let bl = new THREE.Mesh(
    new THREE.PlaneGeometry(0.45, 0.45),
    new THREE.MeshBasicMaterial({
      map: blob,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      opacity: 0.7
    })
  )

  bl.position.z = 0.015
  // scene.add(bl)
  for (let i = 0; i < nr; i++) {
    let b = bl.clone()
    let theta = range(0, 2 * Math.PI)
    let r = range(0.1, 0.2)
    b.position.x = r * Math.sin(theta)
    b.position.y = r * Math.cos(theta)
    b.userData.life = range(-2 * Math.PI, 2 * Math.PI)
    blobs.push(b)
    scene1.add(b)
  }
}

let sign = undefined

function update_blobs () {
  blobs.forEach(b => {
    b.userData.life += 0.3
    b.scale.setScalar(Math.sin(0.5 * b.userData.life))

    if (b.userData.life > 2 * Math.PI) {
      b.userData.life = -2 * Math.PI

      let theta = range(0, 2 * Math.PI)
      let r = range(0.05, 0.12)

      b.position.x = point.x + r * Math.sin(theta)
      b.position.y = point.y + r * Math.cos(theta)
    }
  })


  if (point.x >= 0 && sign === undefined) sign = true
  if (point.x < 0 && sign === undefined) sign = false
  if (point.x >= 0.3 && sign === true) sign = false
  if (point.x <= -0.3 && sign === false) sign = true
  if (sign === true) {
    point.x += 0.005
    point.y = Math.sin(range(-0.05, 0.05 * Math.PI))
  }
  if (sign === false) {
    point.y = Math.sin(range(-0.05, 0.05 * Math.PI))

    point.x -= 0.005
  }
}

function add_reycaster_event () {
  window.addEventListener('pointermove', (event) => {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // console.log(event)
    // console.log(pointer.y)
    // console.log(pointer.x)

    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(scene.children)

    if (intersects[0]) {
      point.copy(intersects[0].point)
    }
  })
}

const animate = () => {
  time += 0.0015
  // mesh.rotation.x = time
  // mesh.rotation.y = time

  update_blobs()
  renderer.setRenderTarget(rendererTarget)
  renderer.render(scene1, camera)
  material.uniforms.mask.value = rendererTarget.texture
  renderer.setRenderTarget(null)
  render()
  window.requestAnimationFrame(animate)
}

export { init, animate }
