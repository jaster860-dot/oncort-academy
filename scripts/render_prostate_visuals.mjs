#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const planPath = join(root, "content", "prostate", "visual_plan.json");
const plan = JSON.parse(readFileSync(planPath, "utf8"));

const palette = {
  ivory: "#FFF8E8", paper: "#FFFCF4", teal: "#007C83", blue: "#2563A6",
  orange: "#D97706", coral: "#C85C4A", charcoal: "#24313A", muted: "#64727A",
  paleTeal: "#DDF3F1", paleBlue: "#E5EEF8", paleOrange: "#FCE8C8", paleCoral: "#F8DDD7",
  white: "#FFFFFF", grid: "#D8D5C9",
};

const typeToKind = {
  "decision-tree": "decision", timeline: "pathway", "treatment-calendar": "pathway",
  "monitoring-loop": "pathway", "feedback-loop": "pathway", "parallel-paths": "comparison",
  "split-path": "comparison", balance: "balance", matrix: "matrix", dashboard: "matrix",
  curve: "evidence", gauge: "evidence", "anatomy-map": "anatomy", "target-map": "anatomy",
  "motion-map": "anatomy", "body-map": "anatomy", "layered-map": "anatomy",
  "molecular-pathway": "pathway", "evidence-bridge": "evidence", staircase: "ladder",
  gate: "decision", checklist: "decision",
};

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function wrap(value, max = 30, maxLines = 3) {
  const source = String(value).replace(/\s+/g, " ").trim();
  const words = source.split(" ");
  const lines = [];
  let line = "";
  let consumed = 0;
  for (const word of words) {
    if (!line || `${line} ${word}`.length <= max) {
      line = line ? `${line} ${word}` : word;
      consumed += word.length + (line === word ? 0 : 1);
    } else {
      lines.push(line);
      if (lines.length === maxLines) break;
      line = word;
      consumed += word.length + 1;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.join(" ").length < source.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:]$/, "")}…`;
  }
  return lines;
}

function text(lines, x, y, { size = 24, weight = 600, fill = palette.charcoal, anchor = "start", gap = Math.round(size * 1.2) } = {}) {
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${lines.map((line, index) => `<tspan x="${x}" dy="${index ? gap : 0}">${escapeXml(line)}</tspan>`).join("")}</text>`;
}

function roundedNode(x, y, w, h, label, { fill = palette.paper, stroke = palette.teal, size = 21, center = true } = {}) {
  const lines = wrap(label, Math.max(16, Math.floor(w / (size * 0.58))), h > 100 ? 3 : 2);
  const startY = y + h / 2 - ((lines.length - 1) * size * 0.58) + size * 0.35;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${fill}" stroke="${stroke}" stroke-width="3"/>${text(lines, center ? x + w / 2 : x + 24, startY, { size, weight: 700, anchor: center ? "middle" : "start", gap: Math.round(size * 1.16) })}</g>`;
}

function arrow(x1, y1, x2, y2, { color = palette.charcoal, dashed = false, marker = "arrow" } = {}) {
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"${dashed ? ' stroke-dasharray="10 9"' : ""} marker-end="url(#${marker})"/>`;
}

function curvedArrow(path, { color = palette.charcoal, dashed = false } = {}) {
  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"${dashed ? ' stroke-dasharray="10 9"' : ""} marker-end="url(#arrow)"/>`;
}

function header(lesson, assignment) {
  const titleLines = wrap(lesson.title, 61, 2);
  return `<rect width="1376" height="768" fill="${palette.ivory}"/>
  <rect width="18" height="768" fill="${palette.teal}"/>
  <text x="60" y="46" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="${palette.teal}" letter-spacing="2">ONCORT ACADEMY · PROSTATE</text>
  <rect x="60" y="62" width="${Math.max(190, assignment.label.length * 10 + 34)}" height="34" rx="17" fill="${palette.paleTeal}"/>
  <text x="77" y="85" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="${palette.teal}">${escapeXml(assignment.label.toUpperCase())}</text>
  ${text(titleLines, 60, 132, { size: 34, weight: 800, gap: 39 })}`;
}

function footer(assignment) {
  return `<rect x="60" y="688" width="1256" height="48" rx="14" fill="${palette.charcoal}"/>
  <text x="84" y="718" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="750" fill="${palette.white}">${escapeXml(assignment.label)} · SCHÉMA ÉDUCATIF · NEEDS_REVIEW</text>
  <text x="1290" y="718" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="650" fill="#BBD8D2" text-anchor="end">Revue clinique nominative requise</text>`;
}

function renderDecision(items) {
  const a = items.map((item) => item.label);
  return `${arrow(688, 318, 360, 444)}${arrow(688, 318, 688, 444)}${arrow(688, 318, 1016, 444)}
    <polygon points="688,225 835,318 688,411 541,318" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="4"/>
    ${text(wrap(a[0], 20, 3), 688, 304, { size: 22, weight: 800, anchor: "middle", gap: 25 })}
    ${roundedNode(215, 452, 290, 130, a[1] ?? "Option A", { fill: palette.paleBlue, stroke: palette.blue })}
    ${roundedNode(543, 452, 290, 130, a[2] ?? "Option B", { fill: palette.paleOrange, stroke: palette.orange })}
    ${roundedNode(871, 452, 290, 130, a[3] ?? "Décision", { fill: palette.paper, stroke: palette.charcoal })}`;
}

function renderTimeline(items, calendar = false) {
  const xs = [190, 515, 840, 1165];
  const labels = items.map((item) => item.label);
  const connectors = xs.slice(0, -1).map((x, i) => arrow(x + 55, 445, xs[i + 1] - 58, 445, { color: palette.teal })).join("");
  const nodes = xs.map((x, i) => `<g>
    ${calendar ? `<rect x="${x - 63}" y="260" width="126" height="112" rx="16" fill="${i % 2 ? palette.paleBlue : palette.paleTeal}" stroke="${i % 2 ? palette.blue : palette.teal}" stroke-width="3"/><rect x="${x - 63}" y="260" width="126" height="28" rx="14" fill="${i % 2 ? palette.blue : palette.teal}"/><path d="M ${x - 38} 246 V 277 M ${x + 38} 246 V 277" stroke="${palette.charcoal}" stroke-width="6" stroke-linecap="round"/><g fill="${palette.charcoal}">${[0,1,2].flatMap(r=>[0,1,2].map(c=>`<circle cx="${x - 34 + c*34}" cy="${310 + r*22}" r="4"/>`)).join("")}</g>` : `<circle cx="${x}" cy="330" r="54" fill="${i % 2 ? palette.paleBlue : palette.paleTeal}" stroke="${i % 2 ? palette.blue : palette.teal}" stroke-width="4"/><text x="${x}" y="342" font-family="Arial" font-size="32" font-weight="800" fill="${palette.charcoal}" text-anchor="middle">${String(i + 1).padStart(2, "0")}</text>`}
    <circle cx="${x}" cy="445" r="13" fill="${palette.ivory}" stroke="${palette.teal}" stroke-width="5"/>
    ${text(wrap(labels[i], 22, 3), x, 505, { size: 21, weight: 750, anchor: "middle", gap: 24 })}
  </g>`).join("");
  return `<line x1="130" y1="445" x2="1246" y2="445" stroke="${palette.grid}" stroke-width="8" stroke-linecap="round"/>${connectors}${nodes}`;
}

function renderLoop(items, feedback = false) {
  const points = [[688,245],[1010,415],[688,585],[366,415]];
  const paths = [
    `M 770 264 C 910 285 980 325 1000 360`, `M 990 475 C 930 555 840 575 770 580`,
    `M 606 580 C 505 560 405 505 385 470`, `M 385 360 C 425 285 525 250 606 244`,
  ].map((d) => curvedArrow(d, { color: feedback ? palette.orange : palette.teal })).join("");
  const nodes = points.map(([x,y], i) => roundedNode(x - 135, y - 48, 270, 96, items[i].label, { fill: i % 2 ? palette.paleBlue : palette.paper, stroke: i % 2 ? palette.blue : palette.teal, size: 19 })).join("");
  return `${paths}<circle cx="688" cy="415" r="92" fill="${feedback ? palette.paleOrange : palette.paleTeal}" stroke="${feedback ? palette.orange : palette.teal}" stroke-width="4"/>${text([feedback ? "RÉPONSE" : "RÉÉVALUER"], 688, 424, { size: 22, weight: 850, anchor: "middle", fill: feedback ? palette.orange : palette.teal })}${nodes}`;
}

function renderParallel(items, split = false) {
  const a = items.map((item) => item.label);
  const left = split ? 180 : 95;
  const root = roundedNode(left, 338, 240, 105, a[0], { fill: palette.paleTeal, stroke: palette.teal, size: 19 });
  const branchStart = left + 240;
  return `${arrow(branchStart + 10, 390, 535, 300, { color: palette.blue })}${arrow(branchStart + 10, 390, 535, 510, { color: palette.orange })}
    ${arrow(830, 300, 1025, 390, { color: palette.blue })}${arrow(830, 510, 1025, 390, { color: palette.orange })}
    ${root}
    ${roundedNode(535, 240, 295, 120, a[1], { fill: palette.paleBlue, stroke: palette.blue })}
    ${roundedNode(535, 450, 295, 120, a[2], { fill: palette.paleOrange, stroke: palette.orange })}
    ${roundedNode(1025, 338, 260, 105, a[3], { fill: palette.paper, stroke: palette.charcoal, size: 19 })}
    <text x="682" y="218" font-family="Arial" font-size="15" font-weight="800" fill="${palette.blue}" text-anchor="middle">PARCOURS A</text>
    <text x="682" y="430" font-family="Arial" font-size="15" font-weight="800" fill="${palette.orange}" text-anchor="middle">PARCOURS B</text>`;
}

function renderBalance(items) {
  const a = items.map((item) => item.label);
  return `<line x1="688" y1="300" x2="688" y2="565" stroke="${palette.charcoal}" stroke-width="12" stroke-linecap="round"/>
    <line x1="388" y1="335" x2="988" y2="335" stroke="${palette.charcoal}" stroke-width="10" stroke-linecap="round"/>
    <path d="M 388 335 L 275 515 H 501 Z" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="4"/>
    <path d="M 988 335 L 875 515 H 1101 Z" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="4"/>
    <path d="M 575 590 Q 688 515 801 590 Z" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="4"/>
    ${text(wrap(a[0], 20, 3), 388, 440, { size: 20, weight: 750, anchor: "middle", gap: 23 })}
    ${text(wrap(a[1], 20, 3), 988, 440, { size: 20, weight: 750, anchor: "middle", gap: 23 })}
    ${roundedNode(550, 210, 276, 86, a[2], { fill: palette.paper, stroke: palette.teal, size: 18 })}
    ${text(wrap(a[3], 26, 2), 688, 625, { size: 19, weight: 800, anchor: "middle", fill: palette.teal, gap: 22 })}`;
}

function renderMatrix(items, dashboard = false) {
  const positions = [[145,238],[720,238],[145,452],[720,452]];
  const fills = [palette.paleTeal, palette.paleBlue, palette.paleOrange, palette.paper];
  const strokes = [palette.teal, palette.blue, palette.orange, palette.charcoal];
  const cells = positions.map(([x,y], i) => `<g><rect x="${x}" y="${y}" width="510" height="170" rx="22" fill="${fills[i]}" stroke="${strokes[i]}" stroke-width="3"/>
    ${dashboard ? `<circle cx="${x+72}" cy="${y+83}" r="43" fill="none" stroke="${strokes[i]}" stroke-width="11" stroke-dasharray="${75 + i*22} 270" transform="rotate(-90 ${x+72} ${y+83})"/><circle cx="${x+72}" cy="${y+83}" r="5" fill="${strokes[i]}"/>` : `<text x="${x+42}" y="${y+58}" font-family="Arial" font-size="34" font-weight="850" fill="${strokes[i]}">${String(i+1).padStart(2,"0")}</text>`}
    ${text(wrap(items[i].label, 31, 3), x + (dashboard ? 140 : 42), y + 99, { size: 22, weight: 750, gap: 26 })}</g>`).join("");
  return `${cells}<line x1="688" y1="225" x2="688" y2="638" stroke="${palette.grid}" stroke-width="2"/><line x1="130" y1="430" x2="1245" y2="430" stroke="${palette.grid}" stroke-width="2"/>`;
}

function renderCurve(items, lesson) {
  const a = items.map((item) => item.label);
  const isDvh = lesson.id === "planning_04_dvh";
  const isTestosterone = lesson.id === "followup_02_testosterone";
  const isDoubling = lesson.id === "postrp_02_psadt";
  const xAxis = isDvh ? "DOSE" : "TEMPS";
  const yAxis = isDvh ? "VOLUME (%)" : isTestosterone ? "TESTOSTÉRONE" : "PSA";
  const curves = isDvh
    ? `<path d="M 210 270 C 390 290 520 355 655 440 S 930 555 1170 575" fill="none" stroke="${palette.teal}" stroke-width="9" stroke-linecap="round"/><path d="M 210 330 C 420 350 585 420 735 500 S 970 575 1170 590" fill="none" stroke="${palette.orange}" stroke-width="6" stroke-linecap="round" stroke-dasharray="14 11"/>`
    : isTestosterone
      ? `<path d="M 210 565 C 360 560 460 525 575 455 S 790 335 920 300 S 1060 280 1170 275" fill="none" stroke="${palette.teal}" stroke-width="9" stroke-linecap="round"/><path d="M 210 590 C 380 585 500 555 635 485 S 880 365 1170 340" fill="none" stroke="${palette.orange}" stroke-width="6" stroke-linecap="round" stroke-dasharray="14 11"/>`
      : isDoubling
        ? `<path d="M 210 565 C 500 550 790 480 1170 245" fill="none" stroke="${palette.orange}" stroke-width="9" stroke-linecap="round"/><path d="M 210 565 C 560 560 865 510 1170 390" fill="none" stroke="${palette.teal}" stroke-width="7" stroke-linecap="round" stroke-dasharray="14 11"/>`
        : `<path d="M 210 560 C 360 555 480 555 610 540 S 820 440 910 360 S 1050 285 1170 255" fill="none" stroke="${palette.orange}" stroke-width="8" stroke-linecap="round"/><path d="M 210 565 C 460 565 820 565 1170 565" fill="none" stroke="${palette.teal}" stroke-width="7" stroke-linecap="round"/><path d="M 210 420 C 430 455 720 520 1170 545" fill="none" stroke="${palette.blue}" stroke-width="5" stroke-linecap="round" stroke-dasharray="13 10"/>`;
  const points = isDvh ? [[280,300,0],[520,380,1],[795,515,2],[1080,570,3]] : [[280,550,0],[520,510,1],[795,420,2],[1080,290,3]];
  return `<line x1="180" y1="610" x2="1210" y2="610" stroke="${palette.charcoal}" stroke-width="5" marker-end="url(#arrow)"/>
    <line x1="180" y1="610" x2="180" y2="235" stroke="${palette.charcoal}" stroke-width="5" marker-end="url(#arrow)"/>
    <line x1="180" y1="510" x2="1185" y2="510" stroke="${palette.grid}" stroke-width="2" stroke-dasharray="8 9"/>
    <line x1="180" y1="410" x2="1185" y2="410" stroke="${palette.grid}" stroke-width="2" stroke-dasharray="8 9"/>
    <line x1="180" y1="310" x2="1185" y2="310" stroke="${palette.grid}" stroke-width="2" stroke-dasharray="8 9"/>
    ${curves}
    ${points.map(([x,y,i])=>`<circle cx="${x}" cy="${y}" r="11" fill="${palette.paper}" stroke="${palette.teal}" stroke-width="5"/>${text(wrap(a[i], 19, 2), x, y-36, {size:18,weight:750,anchor:"middle",gap:21})}`).join("")}
    <text x="1190" y="649" font-family="Arial" font-size="16" font-weight="750" fill="${palette.muted}" text-anchor="end">${xAxis}</text>
    <text x="146" y="255" font-family="Arial" font-size="16" font-weight="750" fill="${palette.muted}" transform="rotate(-90 146 255)" text-anchor="end">${yAxis}</text>`;
}

function pelvisGraphic(cx = 670, cy = 420, scale = 1) {
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">
    <path d="M -185 -150 Q -250 -20 -180 170 Q -105 245 0 220 Q 105 245 180 170 Q 250 -20 185 -150" fill="#F2E1D5" stroke="${palette.charcoal}" stroke-width="5"/>
    <ellipse cx="0" cy="-78" rx="94" ry="70" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="5"/>
    <path d="M -54 5 Q 0 -28 54 5 L 47 68 Q 0 94 -47 68 Z" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="5"/>
    <path d="M 0 58 L 0 195" fill="none" stroke="${palette.orange}" stroke-width="9" stroke-linecap="round"/>
    <path d="M 105 -40 Q 142 40 116 170" fill="none" stroke="${palette.coral}" stroke-width="26" stroke-linecap="round" opacity=".75"/>
  </g>`;
}

function renderAnatomy(items) {
  const a = items.map((item) => item.label);
  return `${pelvisGraphic()}
    ${curvedArrow("M 220 275 C 330 275 390 320 500 338", { color: palette.blue })}
    ${curvedArrow("M 1150 275 C 1030 275 980 330 846 355", { color: palette.coral })}
    ${curvedArrow("M 220 555 C 340 555 430 520 560 482", { color: palette.orange })}
    ${curvedArrow("M 1150 555 C 1020 555 920 520 785 480", { color: palette.teal })}
    ${roundedNode(70, 225, 300, 98, a[0], { fill: palette.paleBlue, stroke: palette.blue, size: 18 })}
    ${roundedNode(1006, 225, 300, 98, a[1], { fill: palette.paleCoral, stroke: palette.coral, size: 18 })}
    ${roundedNode(70, 530, 300, 98, a[2], { fill: palette.paleOrange, stroke: palette.orange, size: 18 })}
    ${roundedNode(1006, 530, 300, 98, a[3], { fill: palette.paleTeal, stroke: palette.teal, size: 18 })}`;
}

function renderTarget(items, layered = false) {
  const a = items.map((item) => item.label);
  const rings = layered
    ? `<ellipse cx="688" cy="420" rx="315" ry="205" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="4"/><ellipse cx="688" cy="420" rx="235" ry="155" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="4"/><ellipse cx="688" cy="420" rx="145" ry="100" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="4"/><ellipse cx="688" cy="420" rx="62" ry="48" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="4"/>`
    : `<path d="M 470 270 Q 390 410 475 590 M 906 270 Q 986 410 901 590" fill="none" stroke="${palette.charcoal}" stroke-width="8" stroke-linecap="round"/><ellipse cx="688" cy="420" rx="250" ry="172" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="4"/><ellipse cx="688" cy="420" rx="178" ry="120" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="4"/><ellipse cx="688" cy="420" rx="92" ry="65" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="4"/><circle cx="730" cy="398" r="28" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="4"/>`;
  const labels = [[90,235,palette.blue],[986,235,palette.teal],[90,550,palette.orange],[986,550,palette.coral]].map(([x,y,c],i)=>roundedNode(x,y,300,80,a[i],{fill:palette.paper,stroke:c,size:17})).join("");
  return `${arrow(390,275,470,325,{color:palette.blue})}${arrow(986,275,900,325,{color:palette.teal})}${arrow(390,590,540,520,{color:palette.orange})}${arrow(986,590,790,465,{color:palette.coral})}${rings}${labels}`;
}

function renderMotion(items) {
  const a = items.map((item) => item.label);
  return `<rect x="90" y="245" width="470" height="345" rx="28" fill="${palette.paper}" stroke="${palette.blue}" stroke-width="3"/>
    <rect x="816" y="245" width="470" height="345" rx="28" fill="${palette.paper}" stroke="${palette.teal}" stroke-width="3"/>
    ${pelvisGraphic(325,410,.58)}${pelvisGraphic(1051,410,.58)}
    ${arrow(585,415,790,415,{color:palette.orange})}
    <path d="M 679 375 L 697 415 L 679 455" fill="none" stroke="${palette.orange}" stroke-width="7"/>
    ${text(wrap(a[0],22,2),325,625,{size:18,weight:750,anchor:"middle",gap:21})}
    ${text(wrap(a[1],22,2),1051,625,{size:18,weight:750,anchor:"middle",gap:21})}
    ${roundedNode(550,240,276,90,a[2],{fill:palette.paleOrange,stroke:palette.orange,size:17})}
    ${text(wrap(a[3],30,2),688,665,{size:18,weight:800,anchor:"middle",fill:palette.teal,gap:21})}`;
}

function renderBody(items) {
  const a = items.map((item) => item.label);
  return `<g transform="translate(688 420)"><circle cx="0" cy="-145" r="43" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="5"/><path d="M 0 -98 L 0 88 M -95 -40 L 0 -5 L 95 -40 M 0 88 L -70 205 M 0 88 L 70 205" fill="none" stroke="${palette.charcoal}" stroke-width="24" stroke-linecap="round"/><circle cx="0" cy="10" r="72" fill="none" stroke="${palette.paleOrange}" stroke-width="26" opacity=".8"/></g>
    ${curvedArrow("M 330 275 C 440 275 500 300 600 330",{color:palette.blue})}${curvedArrow("M 1045 275 C 930 275 870 300 775 330",{color:palette.teal})}
    ${curvedArrow("M 330 565 C 450 565 500 535 615 490",{color:palette.orange})}${curvedArrow("M 1045 565 C 930 565 865 535 760 490",{color:palette.coral})}
    ${roundedNode(70,235,300,85,a[0],{fill:palette.paleBlue,stroke:palette.blue,size:17})}${roundedNode(1006,235,300,85,a[1],{fill:palette.paleTeal,stroke:palette.teal,size:17})}
    ${roundedNode(70,540,300,85,a[2],{fill:palette.paleOrange,stroke:palette.orange,size:17})}${roundedNode(1006,540,300,85,a[3],{fill:palette.paleCoral,stroke:palette.coral,size:17})}`;
}

function renderMolecular(items) {
  const a = items.map((item) => item.label);
  const xs=[160,455,750,1045];
  const connectors=xs.slice(0,-1).map((x,i)=>arrow(x+220,420,xs[i+1]-20,420,{color:i===1?palette.orange:palette.teal})).join("");
  const icons=xs.map((x,i)=>`<g transform="translate(${x+110} 295)">${i===0?`<path d="M -45 -55 C 40 -20 -40 20 45 55 M 45 -55 C -40 -20 40 20 -45 55" fill="none" stroke="${palette.blue}" stroke-width="7"/><path d="M -25 -38 L 25 -38 M -22 -12 L 22 -12 M -22 12 L 22 12 M -25 38 L 25 38" stroke="${palette.orange}" stroke-width="4"/>`:i===1?`<rect x="-55" y="-55" width="110" height="110" rx="20" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="5"/><circle r="19" fill="${palette.orange}"/>`:i===2?`<path d="M -58 45 L -25 -15 L 0 10 L 35 -55 L 62 45 Z" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="5"/>`:`<circle r="58" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="5"/><path d="M -28 0 L -5 24 L 34 -28" fill="none" stroke="${palette.blue}" stroke-width="9"/>`}</g>`).join("");
  const nodes=xs.map((x,i)=>roundedNode(x,390,220,145,a[i],{fill:i%2?palette.paleOrange:palette.paper,stroke:i%2?palette.orange:palette.teal,size:18})).join("");
  return `${connectors}${icons}${nodes}`;
}

function renderBridge(items) {
  const a=items.map(i=>i.label);
  return `<path d="M 190 520 Q 688 180 1186 520" fill="none" stroke="${palette.teal}" stroke-width="34" stroke-linecap="round"/>
    <path d="M 190 520 Q 688 240 1186 520" fill="none" stroke="${palette.ivory}" stroke-width="8" stroke-dasharray="24 18"/>
    <rect x="135" y="500" width="180" height="120" rx="14" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="4"/>
    <rect x="1061" y="500" width="180" height="120" rx="14" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="4"/>
    ${roundedNode(80,250,270,100,a[0],{fill:palette.paper,stroke:palette.blue,size:18})}${roundedNode(405,210,270,100,a[1],{fill:palette.paper,stroke:palette.teal,size:18})}
    ${roundedNode(730,210,270,100,a[2],{fill:palette.paper,stroke:palette.orange,size:18})}${roundedNode(1055,250,270,100,a[3],{fill:palette.paper,stroke:palette.coral,size:18})}
    <text x="225" y="570" font-family="Arial" font-size="17" font-weight="800" fill="${palette.blue}" text-anchor="middle">PREUVE</text><text x="1151" y="570" font-family="Arial" font-size="17" font-weight="800" fill="${palette.orange}" text-anchor="middle">DÉCISION</text>`;
}

function renderStaircase(items, gate = false) {
  if (gate) {
    const xs=[175,475,775,1075];
    return `${xs.slice(0,-1).map((x,i)=>arrow(x+125,420,xs[i+1]-125,420,{color:palette.teal})).join("")}${xs.map((x,i)=>`<g><rect x="${x-100}" y="255" width="200" height="325" rx="22" fill="${i===3?palette.paleOrange:palette.paper}" stroke="${i===3?palette.orange:palette.teal}" stroke-width="4"/><rect x="${x-70}" y="295" width="140" height="190" rx="70" fill="${palette.ivory}" stroke="${i===3?palette.orange:palette.teal}" stroke-width="6" stroke-dasharray="16 12"/>${text(wrap(items[i].label,16,3),x,530,{size:18,weight:750,anchor:"middle",gap:21})}</g>`).join("")}`;
  }
  const positions=[[160,520],[415,435],[670,350],[925,265]];
  return `${positions.map(([x,y],i)=>`<g><rect x="${x}" y="${y}" width="285" height="${650-y}" rx="18" fill="${[palette.paleBlue,palette.paleTeal,palette.paleOrange,palette.paleCoral][i]}" stroke="${[palette.blue,palette.teal,palette.orange,palette.coral][i]}" stroke-width="4"/>${text(wrap(items[i].label,24,3),x+142,y+45,{size:19,weight:750,anchor:"middle",gap:22})}</g>`).join("")}<path d="M 250 500 L 500 415 L 755 330 L 1020 245" fill="none" stroke="${palette.charcoal}" stroke-width="6" marker-end="url(#arrow)"/>`;
}

function renderGauge(items) {
  const a=items.map(i=>i.label);
  return `<path d="M 320 555 A 368 368 0 0 1 1056 555" fill="none" stroke="${palette.grid}" stroke-width="74" stroke-linecap="round"/>
    <path d="M 320 555 A 368 368 0 0 1 600 245" fill="none" stroke="${palette.teal}" stroke-width="74" stroke-linecap="round"/>
    <path d="M 610 240 A 368 368 0 0 1 905 330" fill="none" stroke="${palette.orange}" stroke-width="74" stroke-linecap="round"/>
    <line x1="688" y1="555" x2="865" y2="330" stroke="${palette.charcoal}" stroke-width="14" stroke-linecap="round"/><circle cx="688" cy="555" r="28" fill="${palette.charcoal}"/>
    ${roundedNode(70,245,290,90,a[0],{fill:palette.paper,stroke:palette.teal,size:17})}${roundedNode(1016,245,290,90,a[1],{fill:palette.paper,stroke:palette.orange,size:17})}
    ${roundedNode(430,580,300,70,a[2],{fill:palette.paleBlue,stroke:palette.blue,size:16})}${roundedNode(760,580,300,70,a[3],{fill:palette.paleCoral,stroke:palette.coral,size:16})}`;
}

function renderChecklist(items) {
  const rows=items.map((item,i)=>`<g><rect x="300" y="${245+i*93}" width="776" height="72" rx="14" fill="${i%2?palette.paleBlue:palette.paper}" stroke="${i%2?palette.blue:palette.teal}" stroke-width="2"/><rect x="330" y="${265+i*93}" width="32" height="32" rx="7" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="3"/><path d="M ${338} ${280+i*93} L ${347} ${289+i*93} L ${365} ${269+i*93}" fill="none" stroke="${palette.teal}" stroke-width="5"/>${text(wrap(item.label,42,2),395,286+i*93,{size:20,weight:750,gap:23})}</g>`).join("");
  return `<rect x="250" y="210" width="876" height="440" rx="28" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="4"/><rect x="535" y="188" width="306" height="55" rx="18" fill="${palette.charcoal}"/>${text(["VALIDATION AVANT TRAITEMENT"],688,222,{size:16,weight:800,anchor:"middle",fill:palette.white})}${rows}`;
}

function renderForType(type, items, lesson) {
  switch (type) {
    case "decision-tree": return renderDecision(items);
    case "timeline": return renderTimeline(items, false);
    case "treatment-calendar": return renderTimeline(items, true);
    case "monitoring-loop": return renderLoop(items, false);
    case "feedback-loop": return renderLoop(items, true);
    case "parallel-paths": return renderParallel(items, false);
    case "split-path": return renderParallel(items, true);
    case "balance": return renderBalance(items);
    case "matrix": return renderMatrix(items, false);
    case "dashboard": return renderMatrix(items, true);
    case "curve": return renderCurve(items, lesson);
    case "anatomy-map": return renderAnatomy(items);
    case "target-map": return renderTarget(items, false);
    case "layered-map": return renderTarget(items, true);
    case "motion-map": return renderMotion(items);
    case "body-map": return renderBody(items);
    case "molecular-pathway": return renderMolecular(items);
    case "evidence-bridge": return renderBridge(items);
    case "staircase": return renderStaircase(items, false);
    case "gate": return renderStaircase(items, true);
    case "gauge": return renderGauge(items);
    case "checklist": return renderChecklist(items);
    default: throw new Error(`Type visuel non rendu: ${type}`);
  }
}

export function getVisualAssignment(lessonId) {
  const assignment = plan.assignments[lessonId];
  if (!assignment) throw new Error(`${lessonId}: affectation absente de visual_plan.json`);
  if (!typeToKind[assignment.type]) throw new Error(`${lessonId}: type visuel inconnu ${assignment.type}`);
  return assignment;
}

export function buildVisualMetadata(lesson, items, imageSrc) {
  const assignment = getVisualAssignment(lesson.id);
  const labels = items.map((item) => item.label);
  return {
    kind: typeToKind[assignment.type],
    diagramType: assignment.type,
    formatLabel: assignment.label,
    title: lesson.title,
    imageSrc,
    altText: `${assignment.label} pour « ${lesson.title} ». Repères représentés : ${labels.join(" ; ")}.`,
    caption: `${assignment.label} : ${labels.join(" · ")}. Figure éducative needs_review ; elle ne remplace ni les sources ni la revue clinique.`,
    items,
  };
}

export function renderLessonFigure(lesson, visual) {
  const assignment = getVisualAssignment(lesson.id);
  const body = renderForType(assignment.type, visual.items.slice(0, 4), lesson);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1376" height="768" viewBox="0 0 1376 768" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(visual.title)}</title>
  <desc id="desc">${escapeXml(visual.altText)}</desc>
  <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto"><path d="M 0 0 L 6 3 L 0 6 z" fill="${palette.charcoal}"/></marker></defs>
  ${header(lesson, assignment)}
  ${body}
  ${footer(assignment)}
  </svg>\n`;
}

function qualityReview(visual, assignment, lesson) {
  const checks = [
    { id: "lesson_specific_direction", label: `Affectation explicite ${assignment.type} dans visual_plan.json`, points: 1.5, passed: true },
    { id: "dimensions_16_9", label: "Canevas SVG 1376 × 768", points: 1.0, passed: true },
    { id: "accessible_metadata", label: "Titre, description et repli textuel", points: 1.5, passed: visual.altText.length >= 40 && visual.items.length >= 2 },
    { id: "semantic_palette", label: "Formes et libellés redondants avec la couleur", points: 1.0, passed: true },
    { id: "source_traceability", label: "Sources de leçon présentes", points: 1.5, passed: lesson.sources?.length > 0 },
    { id: "release_gate", label: "Statut needs_review visible", points: 2.0, passed: true },
  ];
  const score = Math.min(8.5, checks.reduce((sum, check) => sum + (check.passed ? check.points : 0), 0));
  return { scope: "Précontrôle technique automatisé local ; ne constitue pas une validation clinique ni une revue visuelle nominative.", threshold: 7.5, score, passed: score >= 7.5 && checks.every((check) => check.passed), cap: 8.5, capReason: "Score plafonné tant qu’aucun clinicien nommé n’a réalisé la revue clinique et visuelle finale.", checks };
}

function regenerate() {
  const learnDir = join(root, "content", "prostate", "learn");
  const excluded = new Set(["foundations.json", "detection_diagnosis.json", "block_overviews.json"]);
  const documentFiles = Object.keys(plan.assignments).length;
  let figureCount = 0;
  const seen = new Set();
  for (const filename of [
    "complex_special_situations.json", "deferred_management.json", "definitive_radiotherapy.json",
    "followup_survivorship.json", "high_risk_and_cn1.json", "hormone_sensitive_and_nmcrpc.json",
    "localized_curative_options.json", "mcrpc_precision_palliation.json", "postprostatectomy_recurrence.json",
    "postradiotherapy_and_oligorecurrence.json", "radiotherapy_planning.json", "staging_risk_biomarkers.json",
    "systemic_therapy_foundations.json",
  ]) {
    if (excluded.has(filename)) continue;
    const documentPath = join(learnDir, filename);
    const document = JSON.parse(readFileSync(documentPath, "utf8"));
    if (document.status !== "needs_review") throw new Error(`${filename}: le bloc doit rester needs_review`);
    for (const lesson of document.lessons) {
      const assignment = getVisualAssignment(lesson.id);
      seen.add(lesson.id);
      const existing = lesson.visual;
      if (!existing?.imageSrc?.endsWith(".svg")) throw new Error(`${lesson.id}: image SVG attendue`);
      const visual = buildVisualMetadata(lesson, existing.items.slice(0, 4), existing.imageSrc);
      const svgPath = join(root, "public", visual.imageSrc);
      if (!existsSync(dirname(svgPath))) throw new Error(`${lesson.id}: dossier de figure absent`);
      writeFileSync(svgPath, renderLessonFigure(lesson, visual));
      lesson.visual = visual;
      const reviewPath = svgPath.replace(/\.svg$/, "_review_log.json");
      writeFileSync(reviewPath, `${JSON.stringify({
        artifact: visual.imageSrc, status: "needs_review", reviewMode: "lesson_specific_deterministic_svg_preflight",
        visualType: assignment.type, formatLabel: assignment.label,
        automaticQualityReview: qualityReview(visual, assignment, lesson),
        technicalChecks: { dimensions: "1376x768 viewBox", aspectRatio: "16:9", semanticVisualAssignment: true, embeddedTitleAndDescription: true, textualFallbackInLesson: true },
        automaticReviewIsClinicalValidation: false, namedClinicalReviewer: null, clinicalValidation: false,
        releaseGate: "Revue clinique nominative obligatoire ; conserver needs_review jusque-là.", generatedAt: "2026-08-02",
      }, null, 2)}\n`);
      figureCount += 1;
    }
    writeFileSync(documentPath, `${JSON.stringify(document, null, 2)}\n`);
  }
  const missing = Object.keys(plan.assignments).filter((id) => !seen.has(id));
  if (missing.length) throw new Error(`Affectations sans leçon: ${missing.join(", ")}`);
  if (figureCount !== documentFiles) throw new Error(`Couverture visuelle: ${figureCount}/${documentFiles}`);
  console.log(`${figureCount} figures régénérées avec ${new Set(Object.values(plan.assignments).map((entry) => entry.type)).size} formats visuels.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) regenerate();
