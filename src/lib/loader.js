import { init, animate } from './core.js'
import * as THREE from 'three'
import t1 from '@/assets/imgs/t1.jpg'
import t2 from '@/assets/imgs/t2.jpg'
import blobTexture from '@/assets/imgs/blob.png'

// NOTE: Core images
let bg1, bg2, blob

function loader () {
  let loading_manager
  loading_manager =  new THREE.LoadingManager()
  bg1 = new THREE.TextureLoader(loading_manager).load(t1)
  bg2 = new THREE.TextureLoader(loading_manager).load(t2)
  blob = new THREE.TextureLoader(loading_manager).load(blobTexture)

  loading_manager.onLoad = function () {
    init('canvas-imr-app')
    animate()
  }
}

export { loader, bg1, bg2, blob }
