const container = document.getElementById('paper');
const {Scene, Arc} = spritejs;

const scene = new Scene({
  container,
  displayRatio: 2,
  // contextType: '2d',
});

const layer = scene.layer();
document.querySelector('#paper canvas').style.backgroundColor = '#eee';

const s = new Arc();
s.attr({
  radius: 5,
  fillColor: 'red',
});

const vertex = `
  attribute vec3 a_vertexPosition;
  attribute vec4 a_color;
  varying vec4 vColor;
  attribute vec3 a_transform0;
  attribute vec3 a_transform1;
  uniform vec2 u_resolution;
  uniform mat3 viewMatrix;
  uniform mat3 projectionMatrix;

  attribute vec2 uv;
  varying vec2 vUv;

  highp float random(vec2 co)
  {
      highp float a = 12.9898;
      highp float b = 78.233;
      highp float c = 43758.5453;
      highp float dt= dot(co.xy ,vec2(a,b));
      highp float sn= mod(dt,3.14);
      return fract(sin(sn) * c);
  }

  varying float randomDelay;

  void main() {
    gl_PointSize = 1.0;

    mat3 modelMatrix = mat3(
      a_transform0.x, a_transform1.x, 0, 
      a_transform0.y, a_transform1.y, 0,
      a_transform0.z, a_transform1.z, 1
    );

    randomDelay = random(vec2(a_transform0.z, a_transform1.z));

    vec3 pos = projectionMatrix * viewMatrix * modelMatrix * vec3(a_vertexPosition.xy, 1.0);
    gl_Position = vec4(pos.xy, 1.0, 1.0);

    vColor = a_color;
    vUv = uv;
  }
`;

const fragment = `
  precision mediump float;
  varying vec4 vColor;
  varying vec2 vUv;
  uniform float u_time;
  varying float randomDelay;
  #define TAU 6.28

  void main() {
    float d = 2.0 * distance(vUv, vec2(0.5));
    float time = u_time + randomDelay;
    float r = mix(0.0, 0.5, 0.5 + 0.5 * sin(5.0 * time));
    gl_FragColor.rgb = vColor.rgb * step(r, 1.0 - d);
    gl_FragColor.a = d * step(r, 1.0 - d);
  }
`;

const program = layer.renderer.createProgram({vertex, fragment});

const count = 50000;

const cloud = new spritejs.Cloud(s, count, {buffer: count});
cloud.setProgram(program);

cloud.setUniforms({
  u_time: 0,
});
layer.append(cloud);

const {width, height} = layer.getResolution();

for(let i = 0; i < count; i++) {
  // 模拟随机位置
  cloud.translate(i, [Math.random() * width, Math.random() * height]);
}

layer.tick((t) => {
  cloud.setUniforms({
    u_time: t / 1000,
  });
});