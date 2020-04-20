const vertex = `
attribute vec3 a_vertexPosition;
attribute vec4 a_color;
varying vec4 vColor;

uniform mat3 viewMatrix;
uniform mat3 projectionMatrix;

void main() {
  gl_PointSize = 1.0;
  vec3 pos = projectionMatrix * viewMatrix * vec3(a_vertexPosition.xy, 1.0);
  gl_Position = vec4(pos.xy, 1.0, 1.0);
  vColor = a_color;
}
`;

const fragment = `
precision mediump float;
varying vec4 vColor;
uniform vec4 u_color;
uniform vec2 u_resolution;
#define PI2 6.2831853

/**
  将直角坐标转为极坐标
*/
vec2 polar(vec2 st, vec2 c) {
  vec2 p = c - st;
  float r = length(p) * 2.0;
  float a = atan(p.y, p.x);

  return vec2(r, a);  
}

/**
  rgb/hsb颜色转换
 */
vec3 rgb2hsb(vec3 c){
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
  rgb = rgb * rgb * (3.0 - 2.0 * rgb);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;
  // 将直角坐标转换成极坐标
  st = polar(st, vec2(0.5));
  // 将RGB色值转换成HSB色值
  vec3 c = rgb2hsb(vColor.rgb);
  // 根据极坐标值h色值
  c.x += st.y / PI2;
  // 将HSB色值转回RGB色值
  c = hsb2rgb(c);
  // 显示颜色
  gl_FragColor = vec4(c, 1);
}
`;

const {Scene, Ring} = spritejs;
const container = document.getElementById('stage');
const scene = new Scene({
  container,
  width: 1200,
  height: 1200,
});

const fglayer = scene.layer('fglayer');

const program = fglayer.renderer.createProgram({vertex, fragment});

const r = new Ring({
  radius: [150, 300],
  pos: [600, 600],
  fillColor: 'red',
});

const {width, height} = fglayer.getResolution();
r.setUniforms({
  u_resolution: [width, height],
});
r.setProgram(program);

fglayer.append(r);