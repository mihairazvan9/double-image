uniform float time;
uniform float progress;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D bg;
uniform sampler2D mask;
uniform vec4 resolution;


void main() {
  vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
  vec4 masky = texture2D(mask, vUv);

  float strength = masky.a;
  float strValue = 2.;
  strength *= strValue;
  strength = min(strValue, strength);
  //  vec4 t = texture2D(bg, newUV + strength * 0.1);
  vec4 t = texture2D(bg, newUV + (strValue - strength) * 0.1);




  gl_FragColor = vec4(newUV, 0., 1.);
  gl_FragColor = t;
  gl_FragColor.a *= masky.a;

  //  gl_FragColor = masky;
}