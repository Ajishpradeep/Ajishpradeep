/*
 * Generates the animated banner for the profile README: a cloud of points
 * that resolves into a human pose — the same figure the front page of
 * ajishpradeep.com draws live with WebGPU, here as plain SVG with SMIL
 * animation, because a README can ship an image and nothing else.
 *
 * Deterministic: the same seed lays the same points every run.
 *
 *   node scripts/build-figure.mjs   →  figure-light.svg, figure-dark.svg
 */
import { writeFileSync } from 'node:fs';

/* ---------------------------------------------------------------- data */

// Joints of a golfer at address (metres; y up; facing +z), from the site's scene.
const J = {
  head: [0.0, 1.56, 0.34], neck: [0.0, 1.43, 0.29],
  lSho: [-0.21, 1.4, 0.27], rSho: [0.21, 1.4, 0.27],
  lElb: [-0.23, 1.14, 0.42], rElb: [0.2, 1.12, 0.41],
  lWri: [-0.04, 0.88, 0.52], rWri: [0.03, 0.86, 0.52],
  thorax: [0.0, 1.27, 0.18], pelvis: [0.0, 0.96, 0.0],
  lHip: [-0.15, 0.94, 0.0], rHip: [0.15, 0.94, 0.0],
  lKne: [-0.17, 0.52, 0.07], rKne: [0.17, 0.52, 0.07],
  lAnk: [-0.2, 0.08, 0.0], rAnk: [0.2, 0.08, 0.0],
  lToe: [-0.22, 0.02, 0.2], rToe: [0.22, 0.02, 0.2],
  grip: [0.0, 0.84, 0.54], shaft: [0.03, 0.44, 0.8], clubhead: [0.06, 0.03, 1.06], toe: [0.18, 0.03, 1.08],
};
const BONES = [
  ['head', 'neck'], ['neck', 'lSho'], ['neck', 'rSho'], ['lSho', 'lElb'], ['rSho', 'rElb'],
  ['lElb', 'lWri'], ['rElb', 'rWri'], ['neck', 'thorax'], ['thorax', 'pelvis'], ['pelvis', 'lHip'],
  ['pelvis', 'rHip'], ['lHip', 'lKne'], ['rHip', 'rKne'], ['lKne', 'lAnk'], ['rKne', 'rAnk'],
  ['lAnk', 'lToe'], ['rAnk', 'rToe'],
];
const CLUB = [['grip', 'shaft'], ['shaft', 'clubhead'], ['clubhead', 'toe']];
const CAMERAS = [
  { at: [0.0, 1.1, 1.45], look: [0.0, 0.95, 0.4] },
  { at: [1.35, 1.1, 0.45], look: [0.0, 0.95, 0.4] },
];
const SIGHTLINES = ['head', 'lSho', 'rSho', 'lWri', 'pelvis', 'lKne', 'rAnk', 'clubhead'];

/* ---------------------------------------------------------------- maths */

let seed = 20250916;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-9))) * Math.cos(2 * Math.PI * rnd());

// Three-quarter view: yaw 0.8 rad about y, then a light orthographic projection.
const YAW = 0.8, TILT = 0.12;
function project([x, y, z]) {
  const x1 = x * Math.cos(YAW) + z * Math.sin(YAW);
  const z1 = -x * Math.sin(YAW) + z * Math.cos(YAW);
  const y1 = y * Math.cos(TILT) - z1 * Math.sin(TILT);
  return [x1, y1];
}

/* ---------------------------------------------------------------- layout */

const W = 1200, H = 420;
const CX = 880, CY = 232, SCALE = 205; // where the golfer stands, px per metre
const px = ([x, y]) => [CX + x * SCALE, CY - (y - 0.9) * SCALE];

function samplePoints() {
  const pts = [];
  const bones = [...BONES.map((b) => [b, false]), ...CLUB.map((b) => [b, true])];
  const len = ([a, b]) => Math.hypot(...J[a].map((v, i) => v - J[b][i]));
  const weights = bones.map(([b, club]) => len(b) * (club ? 0.6 : 1));
  const total = weights.reduce((s, w) => s + w, 0);
  for (let i = 0; i < 420; i += 1) {
    let pick = rnd() * total, bi = 0;
    while (bi < bones.length - 1 && pick > weights[bi]) { pick -= weights[bi]; bi += 1; }
    const [[a, b], club] = bones[bi];
    const onJoint = rnd() < 0.16;
    const t = onJoint ? (rnd() < 0.5 ? 0 : 1) : rnd();
    const r = onJoint ? 0.022 : club ? 0.006 : 0.012;
    const p = J[a].map((v, k) => v + (J[b][k] - v) * t + gauss() * r);
    pts.push({ home: px(project(p)), club });
  }
  return pts;
}

/* ---------------------------------------------------------------- svg */

function figure({ ink, dust, accent, line }) {
  const pts = samplePoints();
  const DUR = 11;
  const circles = pts.map(({ home: [hx, hy], club }) => {
    // Where this point drifts when the structure dissolves: a soft cloud around the figure.
    const nx = CX + 20 + gauss() * 150, ny = CY + gauss() * 105;
    const d = -(rnd() * 2.2).toFixed(2); // stagger
    const ease = 'calcMode="spline" keyTimes="0;0.32;0.68;1" keySplines="0.2 0 0.2 1;0 0 1 1;0.2 0 0.2 1"';
    return `<circle r="${club ? 1.7 : 1.5}" fill="${club ? accent : ink}" fill-opacity="0.9">` +
      `<animate attributeName="cx" values="${nx.toFixed(1)};${hx.toFixed(1)};${hx.toFixed(1)};${nx.toFixed(1)}" dur="${DUR}s" begin="${d}s" repeatCount="indefinite" ${ease}/>` +
      `<animate attributeName="cy" values="${ny.toFixed(1)};${hy.toFixed(1)};${hy.toFixed(1)};${ny.toFixed(1)}" dur="${DUR}s" begin="${d}s" repeatCount="indefinite" ${ease}/>` +
      `</circle>`;
  }).join('\n    ');

  // Ambient dust that never joins the body.
  const dustDots = Array.from({ length: 140 }, () => {
    const x = CX + 30 + gauss() * 260, y = CY + gauss() * 170;
    const x2 = x + gauss() * 14, y2 = y + gauss() * 14;
    return `<circle r="1.1" fill="${dust}" fill-opacity="0.55"><animate attributeName="cx" values="${x.toFixed(1)};${x2.toFixed(1)};${x.toFixed(1)}" dur="${(7 + rnd() * 6).toFixed(1)}s" repeatCount="indefinite"/><animate attributeName="cy" values="${y.toFixed(1)};${y2.toFixed(1)};${y.toFixed(1)}" dur="${(7 + rnd() * 6).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
  }).join('\n    ');

  // Camera frustums and sight-lines, visible only while the body is assembled.
  const segs = [];
  for (const cam of CAMERAS) {
    const at = cam.at, fwd = norm(sub(cam.look, at));
    const right = norm(cross(fwd, [0, 1, 0])), up = norm(cross(right, fwd));
    const c = add(at, mul(fwd, 0.22));
    const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => add(add(c, mul(right, 0.13 * sx)), mul(up, 0.08 * sy)));
    for (let i = 0; i < 4; i += 1) { segs.push([at, corners[i]]); segs.push([corners[i], corners[(i + 1) % 4]]); }
    for (const j of SIGHTLINES) segs.push([at, J[j]]);
  }
  const lines = segs.map(([a, b]) => {
    const [x1, y1] = px(project(a)), [x2, y2] = px(project(b));
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }).join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="AI works because mathematics does. A cloud of points resolves into a human pose, triangulated by two cameras, then dissolves again.">
  <style>
    .t { font-family: "Source Serif 4", "Iowan Old Style", Charter, Georgia, "Times New Roman", serif; fill: ${ink}; }
    .c { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${dust}; }
  </style>
  <text class="t" x="48" y="140" font-size="58" font-weight="500" letter-spacing="-1.2">AI works because</text>
  <text class="t" x="48" y="206" font-size="58" font-weight="500" letter-spacing="-1.2">mathematics does.</text>
  <text class="c" x="48" y="262" font-size="17">Pradeep Rajasekar, also Ajish Pradeep. AI Research Engineer, Taipei.</text>
  <text class="c" x="48" y="288" font-size="17">Human pose in 3D, on a phone. Retail vision at 7,000 stores. LLMs that never do the maths.</text>
  <text class="c" x="48" y="384" font-size="13"><tspan font-weight="600" fill="${ink}">Fig. 1</tspan>  420 points finding a body: two consumer cameras, 29 keypoints, and the club the product needed. Drawn live at ajishpradeep.com.</text>
  <g stroke="${line}" stroke-width="0.7" fill="none">
    <animate attributeName="opacity" values="0;0;0.65;0.65;0;0" keyTimes="0;0.3;0.4;0.62;0.72;1" dur="${DUR}s" repeatCount="indefinite"/>
      ${lines}
  </g>
  <g>
    ${dustDots}
  </g>
  <g>
    ${circles}
  </g>
</svg>
`;
}

const sub = (a, b) => a.map((v, i) => v - b[i]);
const add = (a, b) => a.map((v, i) => v + b[i]);
const mul = (a, k) => a.map((v) => v * k);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };

writeFileSync('figure-light.svg', figure({ ink: '#15181e', dust: '#7b8089', accent: '#1f45e0', line: '#9aa0a8' }));
seed = 20250916;
writeFileSync('figure-dark.svg', figure({ ink: '#e8e9e4', dust: '#8b9098', accent: '#7c96ff', line: '#5b6068' }));
console.log('wrote figure-light.svg, figure-dark.svg');
