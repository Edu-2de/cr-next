// Hero background: WebGL2 noise/warp shader, full-screen, blue-only ramp.
export const VERTEX_SRC = `#version 300 es
void main() {
  vec2 pos[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
}`;

export const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uEnergy;

out vec4 fragColor;

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yxx) * p3.zyx);
}

float perlinNoise(vec3 p) {
  vec3 pi = floor(p);
  vec3 pf = p - pi;
  vec3 w = pf * pf * (3.0 - 2.0 * pf);
  float n000 = dot(pf - vec3(0.0, 0.0, 0.0), hash33(pi + vec3(0.0, 0.0, 0.0)) * 2.0 - 1.0);
  float n100 = dot(pf - vec3(1.0, 0.0, 0.0), hash33(pi + vec3(1.0, 0.0, 0.0)) * 2.0 - 1.0);
  float n010 = dot(pf - vec3(0.0, 1.0, 0.0), hash33(pi + vec3(0.0, 1.0, 0.0)) * 2.0 - 1.0);
  float n110 = dot(pf - vec3(1.0, 1.0, 0.0), hash33(pi + vec3(1.0, 1.0, 0.0)) * 2.0 - 1.0);
  float n001 = dot(pf - vec3(0.0, 0.0, 1.0), hash33(pi + vec3(0.0, 0.0, 1.0)) * 2.0 - 1.0);
  float n101 = dot(pf - vec3(1.0, 0.0, 1.0), hash33(pi + vec3(1.0, 0.0, 1.0)) * 2.0 - 1.0);
  float n011 = dot(pf - vec3(0.0, 1.0, 1.0), hash33(pi + vec3(0.0, 1.0, 1.0)) * 2.0 - 1.0);
  float n111 = dot(pf - vec3(1.0, 1.0, 1.0), hash33(pi + vec3(1.0, 1.0, 1.0)) * 2.0 - 1.0);
  float nx00 = mix(n000, n100, w.x);
  float nx10 = mix(n010, n110, w.x);
  float nx01 = mix(n001, n101, w.x);
  float nx11 = mix(n011, n111, w.x);
  float nxy0 = mix(nx00, nx10, w.y);
  float nxy1 = mix(nx01, nx11, w.y);
  return mix(nxy0, nxy1, w.z);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;

  vec2 st = uv;
  st.x *= aspect;

  // Screen center — anchors the calm zone and the autonomous cursor below.
  vec2 circleCenter = vec2(0.5 * aspect, 0.5);
  float distFromCenter = length(st - circleCenter);

  vec2 mouseUV = uMouse;
  mouseUV.x *= aspect;

  float mouseDist = length(st - mouseUV);
  float mouseFalloff = exp(-mouseDist * mouseDist * 3.2) * uEnergy;

  // Autonomous cursor: drifts in a slow ellipse (mismatched x/y periods so
  // it doesn't repeat mechanically), driving the same falloff as the real
  // cursor so the effect is never fully idle.
  float autoAngle = uTime * 0.11;
  vec2 autoMouseUV = circleCenter + vec2(cos(autoAngle) * 0.24, sin(autoAngle * 0.8) * 0.18);
  float autoDist = length(st - autoMouseUV);
  float autoFalloff = exp(-autoDist * autoDist * 3.2) * 0.8;

  mouseFalloff = max(mouseFalloff, autoFalloff);

  // 0 at center (where the title sits), ramping to 1 toward the edges, so
  // the middle stays calm/readable and the sides carry most of the motion.
  float edgeFactor = smoothstep(0.0, 0.62, distFromCenter);

  float t = uTime * 0.16;
  vec2 warped = st;
  float freq = 1.3;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float n = perlinNoise(vec3(warped * freq + fi * 4.1, t + fi * 1.6));
    float angle = n * 6.28318 * 1.4 + mouseFalloff * 4.5;
    float amount = (0.16 + mouseFalloff * 0.9) * (0.8 - fi * 0.2) * mix(0.3, 1.0, edgeFactor);
    warped += vec2(cos(angle), sin(angle)) * amount;
    freq *= 1.9;
  }

  float bands = sin(warped.x * 2.4 + warped.y * 1.0 + uTime * 0.13) * 0.5 + 0.5;
  float haze = perlinNoise(vec3(warped * 0.75, t * 0.6)) * 0.5 + 0.5;

  float n = clamp(bands * 0.65 + haze * 0.55, 0.0, 1.0);
  // Power >1 compresses low/mid values toward 0 so only genuine peaks stay bright.
  n = pow(n, 1.5);

  // Calm mid-tone at center, full noise range only once edgeFactor ramps up.
  float calmN = 0.4;
  n = mix(calmN, n, edgeFactor);

  // Cursor carves out a light void (pushes blue aside) rather than adding more blue.
  n -= mouseFalloff * 0.6;
  n = clamp(n, 0.0, 1.0);

  // Blue-only ramp — no step gets close to white/pale.
  vec3 deep = vec3(0.30, 0.46, 0.68);
  vec3 mid = vec3(0.20, 0.40, 0.66);
  vec3 bright = vec3(0.12, 0.27, 0.48);
  vec3 hot = vec3(0.05, 0.11, 0.22);

  vec3 color = mix(deep, mid, smoothstep(0.1, 0.35, n));
  color = mix(color, bright, smoothstep(0.4, 0.62, n));
  color = mix(color, hot, smoothstep(0.78, 1.0, n));
  color = mix(color, deep, mouseFalloff * 0.7);

  fragColor = vec4(color, 1.0);
}`;
