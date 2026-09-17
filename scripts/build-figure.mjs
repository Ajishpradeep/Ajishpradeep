/*
 * Generates the animated banner for the profile README: 420 points that find
 * structure, lose it, and find a different one — pure SVG with SMIL, because
 * a README can ship an image and nothing else.
 *
 * Three formations, none of them a product:
 *   noise   — no structure yet
 *   surface — a torus seen through two cameras, sight-lines to the points they
 *             triangulate: multi-view geometry, the mathematics under every
 *             reconstruction whatever the object is
 *   matrix  — a masked self-attention matrix, density as weight: the
 *             mathematics under every language model
 *
 * Deterministic: the same seed lays the same points every run.
 *
 *   node scripts/build-figure.mjs   →  figure-light.svg, figure-dark.svg
 */
import { writeFileSync } from 'node:fs';

/* ---------------------------------------------------------------- maths */

let seed = 20250916;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-9))) * Math.cos(2 * Math.PI * rnd());

const sub = (a, b) => a.map((v, i) => v - b[i]);
const add = (a, b) => a.map((v, i) => v + b[i]);
const mul = (a, k) => a.map((v) => v * k);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };

// Orthographic three-quarter view: yaw about y, then tilt about x.
function project([x, y, z], yaw, tilt) {
  const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
  const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
  const y1 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
  return [x1, y1];
}

/* ---------------------------------------------------------------- layout */

const W = 1200, H = 420, N = 420;
const CX = 905, CY = 205, SCALE = 165; // figure centre and px per unit
const px = ([x, y]) => [CX + x * SCALE, CY - y * SCALE];

/* --- surface: a torus, R=0.62 r=0.24, turning slowly while it is held. */
const R = 0.74, r = 0.17;
const torusPoints = Array.from({ length: N }, () => {
  const u = rnd() * 2 * Math.PI, v = rnd() * 2 * Math.PI;
  return [(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)];
});
const TILT = 0.95;
const torusA = torusPoints.map((p) => px(project(p, 0.3, TILT)));
const torusB = torusPoints.map((p) => px(project(p, 1.5, TILT)));

/* --- two cameras looking at the surface, from the same view as torusA. */
const CAMERAS = [
  { at: [0.0, 0.8, 1.35], look: [0, 0, 0] },
  { at: [1.4, 0.8, 0.25], look: [0, 0, 0] },
];
const sightTargets = [3, 91, 205, 260, 388];

/* --- matrix: 7×7 masked self-attention over one sentence; density is weight. */
const T = 7;
const attention = [];
for (let row = 0; row < T; row += 1) {
  const logits = [];
  for (let col = 0; col < T; col += 1) {
    if (col > row) { logits.push(-Infinity); continue; }
    let l = rnd() * 1.2;
    if (col === row) l += 1.1;
    if (col === 0) l += 0.4;
    if (row === 4 && col === 1) l += 1.8;
    if (row === 6 && (col === 5 || col === 2)) l += 1.4;
    logits.push(l);
  }
  const m = Math.max(...logits);
  const e = logits.map((l) => (l === -Infinity ? 0 : Math.exp(l - m)));
  const z = e.reduce((s, v) => s + v, 0);
  attention.push(e.map((v) => v / z));
}
const cell = 0.2, half = ((T - 1) * cell) / 2, perRow = Math.floor(N / T);
const gridPts = [];
for (let row = 0; row < T; row += 1) {
  let placed = 0;
  for (let col = 0; col <= row; col += 1) {
    const want = col === row ? perRow - placed : Math.round(attention[row][col] * perRow);
    for (let q = 0; q < want; q += 1) {
      gridPts.push(px([-half + col * cell + (rnd() - 0.5) * cell * 0.8, half - row * cell + (rnd() - 0.5) * cell * 0.8]));
    }
    placed += want;
  }
}
while (gridPts.length < N) gridPts.push(px([half + (rnd() - 0.5) * cell * 0.8, -half + (rnd() - 0.5) * cell * 0.8]));

/* ---------------------------------------------------------------- svg */

const DUR = 18;
// noise → surface (turning) → matrix (held) → noise
const KEYTIMES = '0;0.16;0.42;0.54;0.78;1';
const SPLINES = '0.2 0 0.2 1;0 0 1 1;0.2 0 0.2 1;0 0 1 1;0.2 0 0.2 1';
const EASE = `calcMode="spline" keyTimes="${KEYTIMES}" keySplines="${SPLINES}"`;

function figure({ ink, dust, accent, line }) {
  seed = 424242;
  const f = (v) => v.toFixed(1);
  const circles = Array.from({ length: N }, (_, i) => {
    const nx = CX + 10 + gauss() * 150, ny = CY + 10 + gauss() * 105;
    const [ax, ay] = torusA[i], [bx, by] = torusB[i], [gx, gy] = gridPts[i];
    const d = -(rnd() * 1.6).toFixed(2);
    const lit = sightTargets.includes(i);
    return `<circle r="${lit ? 2.1 : 1.5}" fill="${lit ? accent : ink}" fill-opacity="0.9">` +
      `<animate attributeName="cx" values="${f(nx)};${f(ax)};${f(bx)};${f(gx)};${f(gx)};${f(nx)}" dur="${DUR}s" begin="${d}s" repeatCount="indefinite" ${EASE}/>` +
      `<animate attributeName="cy" values="${f(ny)};${f(ay)};${f(by)};${f(gy)};${f(gy)};${f(ny)}" dur="${DUR}s" begin="${d}s" repeatCount="indefinite" ${EASE}/>` +
      `</circle>`;
  }).join('\n    ');

  // Ambient dust that never joins the structure.
  const dustDots = Array.from({ length: 140 }, () => {
    const x = CX + 30 + gauss() * 260, y = CY + gauss() * 170;
    const x2 = x + gauss() * 14, y2 = y + gauss() * 14;
    return `<circle r="1.1" fill="${dust}" fill-opacity="0.55"><animate attributeName="cx" values="${f(x)};${f(x2)};${f(x)}" dur="${(7 + rnd() * 6).toFixed(1)}s" repeatCount="indefinite"/><animate attributeName="cy" values="${f(y)};${f(y2)};${f(y)}" dur="${(7 + rnd() * 6).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
  }).join('\n    ');

  // Camera frustums and sight-lines, visible only while the surface is assembled.
  const segs = [];
  for (const cam of CAMERAS) {
    const at = cam.at, fwd = norm(sub(cam.look, at));
    const right = norm(cross(fwd, [0, 1, 0])), up = norm(cross(right, fwd));
    const c = add(at, mul(fwd, 0.24));
    const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => add(add(c, mul(right, 0.14 * sx)), mul(up, 0.09 * sy)));
    for (let i = 0; i < 4; i += 1) { segs.push([at, corners[i]]); segs.push([corners[i], corners[(i + 1) % 4]]); }
    for (const t of sightTargets) segs.push([at, torusPoints[t]]);
  }
  const lines = segs.map(([a, b]) => {
    const [x1, y1] = px(project(a, 0.3, TILT)), [x2, y2] = px(project(b, 0.3, TILT));
    return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  }).join('\n      ');

  // Axis labels for the matrix, visible only while it is held.
  const labels = Array.from({ length: T }, (_, i) => {
    const [x] = px([-half + i * cell, 0]), [, y] = px([0, half - i * cell]);
    const [, top] = px([0, half + cell * 0.9]), [left] = px([-half - cell * 0.9, 0]);
    return `<text x="${f(x)}" y="${f(top)}" text-anchor="middle">k${i + 1}</text><text x="${f(left)}" y="${f(y + 4)}" text-anchor="end">q${i + 1}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="AI works because mathematics does. A cloud of points resolves into a surface seen by two cameras, then into a masked attention matrix, then dissolves again.">
  <style>
    .t { font-family: "Source Serif 4", "Iowan Old Style", Charter, Georgia, "Times New Roman", serif; fill: ${ink}; }
    .c { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${dust}; }
    .m { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 9px; fill: ${dust}; }
  </style>
  <text class="t" x="48" y="140" font-size="58" font-weight="500" letter-spacing="-1.2">AI works because</text>
  <text class="t" x="48" y="206" font-size="58" font-weight="500" letter-spacing="-1.2">mathematics does.</text>
  <text class="c" x="48" y="262" font-size="17">Pradeep Rajasekar, also Ajish Pradeep. AI Research Engineer, Taipei.</text>
  <text class="c" x="48" y="288" font-size="17">3D vision and geometry. On-device inference. LLM systems that never do the maths.</text>
  <g stroke="${line}" stroke-width="0.7" fill="none">
    <animate attributeName="opacity" values="0;0;0.7;0.7;0;0" keyTimes="0;0.14;0.2;0.3;0.38;1" dur="${DUR}s" repeatCount="indefinite"/>
      ${lines}
  </g>
  <g class="m">
    <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.52;0.58;0.76;0.82;1" dur="${DUR}s" repeatCount="indefinite"/>
    ${labels}
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

writeFileSync('figure-light.svg', figure({ ink: '#15181e', dust: '#7b8089', accent: '#1f45e0', line: '#9aa0a8' }));
writeFileSync('figure-dark.svg', figure({ ink: '#e8e9e4', dust: '#8b9098', accent: '#7c96ff', line: '#5b6068' }));
console.log('wrote figure-light.svg, figure-dark.svg');
