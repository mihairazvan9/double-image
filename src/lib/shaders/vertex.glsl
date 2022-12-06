varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
  //  gl_PointSize = 25. * (1. / - mvPosition.z);
  //  gl_Position = projectionMatrix * mvPosition;

  gl_Position = projectionMatrix * mvPosition;
}