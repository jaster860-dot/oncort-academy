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
  <text x="84" y="718" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="750" fill="${palette.white}">${escapeXml(assignment.label)} · PÉDAGOGIQUE · NON À L’ÉCHELLE · SANS DONNÉE PATIENT</text>
  <text x="1290" y="718" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="650" fill="#BBD8D2" text-anchor="end">Sources et limites dans la leçon</text>`;
}

function renderDecision(items) {
  const a = items.map((item) => item.label);
  const xs = [95, 414, 733, 1052];
  const colors = [palette.blue, palette.teal, palette.orange, palette.coral];
  return `<rect x="70" y="218" width="1236" height="390" rx="24" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="3"/>
    <text x="688" y="250" font-family="Arial" font-size="15" font-weight="850" fill="${palette.muted}" text-anchor="middle">ALGORITHME CONCEPTUEL · CHAQUE ÉTAPE DOIT ÊTRE DOCUMENTÉE</text>
    ${xs.slice(0,-1).map((x,i)=>arrow(x+235,420,xs[i+1]-18,420,{color:colors[i]})).join("")}
    ${xs.map((x,i)=>`<g><polygon points="${x+115},300 ${x+225},420 ${x+115},540 ${x+5},420" fill="${i%2?palette.paleTeal:palette.paleBlue}" stroke="${colors[i]}" stroke-width="4"/>${text(wrap(a[i],18,4),x+115,394,{size:18,weight:850,anchor:"middle",gap:21})}<text x="${x+115}" y="570" font-family="Arial" font-size="14" font-weight="800" fill="${colors[i]}" text-anchor="middle">ÉTAPE ${i+1}</text></g>`).join("")}`;
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
  return `<text x="688" y="215" font-family="Arial" font-size="15" font-weight="850" fill="${palette.muted}" text-anchor="middle">CHRONOLOGIE CONCEPTUELLE · NON À L’ÉCHELLE · DURÉES SELON PROTOCOLE</text><line x1="130" y1="445" x2="1246" y2="445" stroke="${palette.grid}" stroke-width="8" stroke-linecap="round"/>${connectors}${nodes}`;
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
  return `<text x="688" y="215" font-family="Arial" font-size="15" font-weight="850" fill="${palette.muted}" text-anchor="middle">AXES À METTRE EN REGARD · LE LIEN EXACT EST PRÉCISÉ DANS LA LEÇON</text>
    ${roundedNode(70, 350, 260, 120, a[0], { fill: palette.paleTeal, stroke: palette.teal, size: 19 })}
    ${arrow(350, 410, 485, 320, { color: palette.blue })}${arrow(350, 410, 485, 510, { color: palette.orange })}
    <text x="668" y="238" font-family="Arial" font-size="15" font-weight="850" fill="${palette.blue}" text-anchor="middle">AXE 1</text>${roundedNode(505,255,326,130,a[1],{fill:palette.paleBlue,stroke:palette.blue,size:20})}
    <text x="668" y="446" font-family="Arial" font-size="15" font-weight="850" fill="${palette.orange}" text-anchor="middle">AXE 2</text>${roundedNode(505,465,326,130,a[2],{fill:palette.paleOrange,stroke:palette.orange,size:20})}
    ${arrow(851, 320, 1000, 410, { color: palette.blue })}${arrow(851, 530, 1000, 410, { color: palette.orange })}
    ${roundedNode(1020,350,286,120,a[3],{fill:palette.paper,stroke:palette.charcoal,size:19})}`;
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

function firstSentence(value, max = 190) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  const sentence = normalized.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? normalized;
  return sentence.length <= max ? sentence : `${sentence.slice(0, max - 1).replace(/[,;:\s]+$/, "")}…`;
}

export function buildScientificItems(lesson) {
  const sections = Array.isArray(lesson.sections) ? lesson.sections.slice(0, 3) : [];
  const labels = Array.isArray(lesson.causalChain) && lesson.causalChain.length >= 4
    ? lesson.causalChain.slice(0, 4)
    : [...sections.map((section) => section.title), "Point de vigilance"].slice(0, 4);
  const details = [
    ...sections.map((section) => `${section.title} — ${firstSentence(section.body)}`),
    `Décision au checkpoint — ${firstSentence(`${lesson.checkpoint?.explanation ?? ""} Piège : ${lesson.commonTrap ?? ""}`)}`,
  ];
  return labels.map((label, index) => ({ label, detail: details[index] ?? firstSentence(lesson.commonTrap) })).slice(0, 4);
}

function callout(x, y, w, titleValue, bodyValue, { stroke = palette.teal, fill = palette.paper } = {}) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="112" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    ${text(wrap(titleValue, Math.floor(w / 13), 2), x + 18, y + 31, { size: 17, weight: 850, fill: stroke, gap: 19 })}
    ${text(wrap(bodyValue, Math.floor(w / 10.5), 3), x + 18, y + 62, { size: 14, weight: 600, gap: 18 })}</g>`;
}

function planningSimulation() {
  return `<g>
    <text x="170" y="218" font-family="Arial" font-size="17" font-weight="850" fill="${palette.blue}" text-anchor="middle">1 · PRÉPARATION</text>
    <rect x="70" y="238" width="330" height="290" rx="22" fill="${palette.paper}" stroke="${palette.blue}" stroke-width="3"/>
    <ellipse cx="235" cy="350" rx="75" ry="58" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="4"/><text x="235" y="357" font-family="Arial" font-size="18" font-weight="800" fill="${palette.charcoal}" text-anchor="middle">Vessie confortable</text>
    <path d="M 174 430 Q 235 398 296 430 L 282 486 Q 235 510 188 486 Z" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="4"/><text x="235" y="459" font-family="Arial" font-size="17" font-weight="800" fill="${palette.charcoal}" text-anchor="middle">Prostate</text>
    <path d="M 329 330 Q 360 405 329 495" fill="none" stroke="${palette.coral}" stroke-width="24" stroke-linecap="round"/><text x="318" y="522" font-family="Arial" font-size="15" font-weight="750" fill="${palette.coral}" text-anchor="end">Rectum peu distendu</text>
    ${arrow(420, 383, 505, 383, { color: palette.teal })}
    <text x="688" y="218" font-family="Arial" font-size="17" font-weight="850" fill="${palette.teal}" text-anchor="middle">2 · GÉOMÉTRIE REPRODUCTIBLE</text>
    <rect x="505" y="238" width="366" height="290" rx="22" fill="${palette.paper}" stroke="${palette.teal}" stroke-width="3"/>
    <rect x="557" y="277" width="262" height="196" rx="18" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="3"/><circle cx="688" cy="321" r="25" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="4"/><path d="M 688 347 V 427 M 631 374 L 688 391 L 745 374 M 688 427 L 647 467 M 688 427 L 729 467" fill="none" stroke="${palette.charcoal}" stroke-width="13" stroke-linecap="round"/><line x1="538" y1="490" x2="838" y2="490" stroke="${palette.blue}" stroke-width="5"/><text x="688" y="515" font-family="Arial" font-size="15" font-weight="700" fill="${palette.charcoal}" text-anchor="middle">Position simple, confortable, répétable</text>
    ${arrow(891, 383, 976, 383, { color: palette.teal })}
    <text x="1140" y="218" font-family="Arial" font-size="17" font-weight="850" fill="${palette.orange}" text-anchor="middle">3 · ACQUISITIONS CONCORDANTES</text>
    <rect x="976" y="238" width="330" height="290" rx="22" fill="${palette.paper}" stroke="${palette.orange}" stroke-width="3"/>
    <rect x="1012" y="280" width="112" height="158" rx="13" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="3"/><text x="1068" y="360" font-family="Arial" font-size="24" font-weight="850" fill="${palette.blue}" text-anchor="middle">CT</text>
    <rect x="1158" y="280" width="112" height="158" rx="13" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="3"/><text x="1214" y="360" font-family="Arial" font-size="24" font-weight="850" fill="${palette.teal}" text-anchor="middle">IRM</text>
    <path d="M 1124 335 C 1142 310 1142 310 1158 335 M 1124 385 C 1142 410 1142 410 1158 385" fill="none" stroke="${palette.orange}" stroke-width="5" stroke-dasharray="8 7"/><text x="1141" y="473" font-family="Arial" font-size="15" font-weight="750" fill="${palette.charcoal}" text-anchor="middle">Fusion vérifiée</text>
    ${callout(70, 555, 1236, "Action si anatomie non représentative", "Corriger gaz/selles ou préparation, réévaluer puis répéter l’acquisition si nécessaire : l’IGRT ne corrige pas une déformation majeure.", { stroke: palette.coral, fill: palette.paleCoral })}
  </g>`;
}

function planningTargets() {
  return `<g>
    <text x="395" y="210" font-family="Arial" font-size="16" font-weight="850" fill="${palette.muted}" text-anchor="middle">COUPE AXIALE SCHÉMATIQUE · ANTÉRIEUR EN HAUT</text>
    <rect x="70" y="228" width="650" height="405" rx="24" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="3"/>
    <ellipse cx="395" cy="315" rx="115" ry="65" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="4"/><text x="395" y="320" font-family="Arial" font-size="17" font-weight="800" fill="${palette.charcoal}" text-anchor="middle">Vessie</text>
    <path d="M 320 405 Q 395 355 470 405 L 458 502 Q 395 548 332 502 Z" fill="#FDF1CF" stroke="${palette.orange}" stroke-width="6"/>
    <path d="M 302 391 Q 395 335 488 391 L 478 517 Q 395 571 312 517 Z" fill="none" stroke="${palette.teal}" stroke-width="6"/>
    <path d="M 284 372 Q 395 310 506 372 L 500 535 Q 395 596 290 535 Z" fill="none" stroke="${palette.blue}" stroke-width="5" stroke-dasharray="13 9"/>
    <path d="M 423 418 q 30 -23 49 4 q -1 37 -39 43 q -27 -16 -10 -47" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="4"/>
    <line x1="395" y1="410" x2="395" y2="530" stroke="${palette.charcoal}" stroke-width="7"/><text x="405" y="490" font-family="Arial" font-size="14" font-weight="750" fill="${palette.charcoal}">Urètre</text>
    <ellipse cx="395" cy="570" rx="82" ry="30" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="5"/><text x="395" y="576" font-family="Arial" font-size="15" font-weight="800" fill="${palette.coral}" text-anchor="middle">Rectum (postérieur)</text>
    ${text(["GTV-DIL"], 95, 288, { size: 18, weight: 850, fill: palette.coral })}<line x1="185" y1="282" x2="422" y2="428" stroke="${palette.coral}" stroke-width="3"/>
    ${text(["CTV anatomique"], 95, 328, { size: 18, weight: 850, fill: palette.teal })}<line x1="236" y1="323" x2="316" y2="408" stroke="${palette.teal}" stroke-width="3"/>
    ${text(["PTV = incertitudes"], 95, 368, { size: 18, weight: 850, fill: palette.blue })}<line x1="260" y1="363" x2="293" y2="391" stroke="${palette.blue}" stroke-width="3" stroke-dasharray="7 5"/>
    <rect x="756" y="228" width="550" height="126" rx="18" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="3"/>${text(["1 · CTV"], 784, 264, { size: 19, weight: 850, fill: palette.teal })}${text(wrap("Prostate entière + extensions identifiées ; vésicules selon risque/extension, complètes si T3b.", 55, 3), 784, 296, { size: 16, weight: 650, gap: 20 })}
    <rect x="756" y="374" width="550" height="126" rx="18" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="3"/>${text(["2 · PTV"], 784, 410, { size: 19, weight: 850, fill: palette.blue })}${text(wrap("Marge issue du budget d’incertitudes : contourage, repositionnement, mouvement et IGRT réels.", 55, 3), 784, 442, { size: 16, weight: 650, gap: 20 })}
    <rect x="756" y="520" width="550" height="113" rx="18" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="3"/>${text(["3 · Pelvis ≠ prostate"], 784, 556, { size: 19, weight: 850, fill: palette.orange })}${text(wrap("Le volume ganglionnaire n’est ajouté que s’il est indiqué et ne partage pas automatiquement la même marge.", 55, 3), 784, 588, { size: 16, weight: 650, gap: 20 })}
  </g>`;
}

function planningOar() {
  return `<g>
    <rect x="70" y="225" width="720" height="420" rx="24" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="3"/>
    <text x="430" y="255" font-family="Arial" font-size="16" font-weight="850" fill="${palette.muted}" text-anchor="middle">VOISINAGE ANATOMIQUE · SCHÉMA NON À L’ÉCHELLE</text>
    <ellipse cx="430" cy="342" rx="112" ry="68" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="5"/><text x="430" y="349" font-family="Arial" font-size="18" font-weight="800" fill="${palette.charcoal}" text-anchor="middle">Vessie</text>
    <path d="M 360 430 Q 430 388 500 430 L 486 518 Q 430 555 374 518 Z" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="5"/><text x="430" y="475" font-family="Arial" font-size="18" font-weight="800" fill="${palette.charcoal}" text-anchor="middle">Prostate</text>
    <line x1="430" y1="433" x2="430" y2="548" stroke="${palette.orange}" stroke-width="8"/><text x="445" y="543" font-family="Arial" font-size="15" font-weight="750" fill="${palette.orange}">Urètre</text>
    <ellipse cx="430" cy="568" rx="105" ry="34" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="5"/><text x="430" y="575" font-family="Arial" font-size="16" font-weight="800" fill="${palette.coral}" text-anchor="middle">Rectum (postérieur)</text>
    <circle cx="212" cy="476" r="62" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="4"/><circle cx="648" cy="476" r="62" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="4"/><text x="212" y="561" font-family="Arial" font-size="15" font-weight="750" fill="${palette.orange}" text-anchor="middle">Têtes fémorales</text>
    <text x="430" y="625" font-family="Arial" font-size="13" font-weight="750" fill="${palette.muted}" text-anchor="middle">Canal anal et bulbe pénien : autres niveaux de coupe</text>
    ${callout(830, 225, 476, "Structure + définition source", "Rectum entier ou paroi, vessie entière ou paroi : la contrainte doit correspondre exactement au contour utilisé.", { stroke: palette.teal, fill: palette.paleTeal })}
    ${callout(830, 357, 476, "Selon technique et antécédents", "Urètre, col/trigone, sphincter, cavité de TURP et bowel bag peuvent devenir nécessaires.", { stroke: palette.blue, fill: palette.paleBlue })}
    ${callout(830, 489, 476, "Interdiction méthodologique", "Ne jamais transférer un seuil entre structures ou fractionnements différents sans source concordante.", { stroke: palette.coral, fill: palette.paleCoral })}
  </g>`;
}

function planningDvh() {
  const plot = `<line x1="110" y1="610" x2="760" y2="610" stroke="${palette.charcoal}" stroke-width="4" marker-end="url(#arrow)"/><line x1="110" y1="610" x2="110" y2="248" stroke="${palette.charcoal}" stroke-width="4" marker-end="url(#arrow)"/>
    ${[0,20,40,60,80,100].map((v,i)=>`<text x="${110+i*125}" y="637" font-family="Arial" font-size="13" fill="${palette.muted}" text-anchor="middle">${v}</text>`).join("")}<text x="748" y="660" font-family="Arial" font-size="15" font-weight="750" fill="${palette.charcoal}" text-anchor="end">Dose (Gy)</text>
    ${[0,20,40,60,80,100].map((v,i)=>`<text x="88" y="${615-i*67}" font-family="Arial" font-size="13" fill="${palette.muted}" text-anchor="end">${v}</text>`).join("")}<text x="45" y="300" font-family="Arial" font-size="15" font-weight="750" fill="${palette.charcoal}" transform="rotate(-90 45 300)" text-anchor="end">Volume relatif (%)</text>
    <path d="M 110 275 L 535 275 C 595 278 625 300 648 390 C 670 480 682 560 690 605" fill="none" stroke="${palette.teal}" stroke-width="7"/><path d="M 110 275 C 230 300 390 385 520 498 C 588 555 660 592 750 607" fill="none" stroke="${palette.coral}" stroke-width="6" stroke-dasharray="13 8"/><path d="M 110 275 C 330 282 520 330 610 455 C 660 525 700 578 750 606" fill="none" stroke="${palette.blue}" stroke-width="5" stroke-dasharray="4 8"/>
    <line x1="470" y1="274" x2="470" y2="610" stroke="${palette.grid}" stroke-width="2" stroke-dasharray="7 7"/><text x="500" y="304" font-family="Arial" font-size="14" font-weight="800" fill="${palette.teal}">PTV synthétique</text><text x="360" y="470" font-family="Arial" font-size="14" font-weight="800" fill="${palette.coral}">Rectum synthétique</text><text x="545" y="420" font-family="Arial" font-size="14" font-weight="800" fill="${palette.blue}">Vessie synthétique</text>`;
  return `<g><rect x="70" y="215" width="720" height="450" rx="22" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="3"/>${plot}<rect x="92" y="225" width="314" height="30" rx="15" fill="${palette.paleOrange}"/><text x="249" y="246" font-family="Arial" font-size="14" font-weight="850" fill="${palette.orange}" text-anchor="middle">COURBES PÉDAGOGIQUES · AUCUNE DONNÉE PATIENT</text>
    ${callout(830, 215, 476, "60 Gy en 20 fractions — couverture", "PTV V57 ≥ 99 % ; CTV V60 ≥ 99 % ; PTV D1 cm³ ≤ 63 Gy.", { stroke: palette.teal, fill: palette.paleTeal })}
    ${callout(830, 347, 476, "60 Gy en 20 fractions — OAR", "Rectum V46 < 30 %, V37 < 50 % ; vessie V60 < 5 %, V48 < 25 %, V41 ≤ 50 %.", { stroke: palette.blue, fill: palette.paleBlue })}
    ${callout(830, 479, 476, "36,25 Gy en 5 fractions ≠ même jeu", "Rectum D1 cm³ < 36 Gy ; vessie V37 < 10 cm³ ; urètre V42 < 50 %. Ne pas mélanger.", { stroke: palette.orange, fill: palette.paleOrange })}
  </g>`;
}

function planningIgrt() {
  return `<g>
    <rect x="70" y="225" width="520" height="355" rx="24" fill="${palette.paper}" stroke="${palette.blue}" stroke-width="3"/><text x="330" y="263" font-family="Arial" font-size="18" font-weight="850" fill="${palette.blue}" text-anchor="middle">1 · REPÈRE PELVIEN</text>
    <path d="M 180 315 Q 125 420 190 520 M 480 315 Q 535 420 470 520" fill="none" stroke="${palette.charcoal}" stroke-width="12"/><path d="M 205 340 Q 330 285 455 340 L 430 500 Q 330 555 230 500 Z" fill="${palette.paleBlue}" fill-opacity=".65" stroke="${palette.blue}" stroke-width="5"/><path d="M 218 352 Q 343 297 468 352 L 443 512 Q 343 567 243 512 Z" fill="none" stroke="${palette.orange}" stroke-width="5" stroke-dasharray="11 8"/><text x="330" y="548" font-family="Arial" font-size="15" font-weight="750" fill="${palette.charcoal}" text-anchor="middle">Os / chaînes pelviennes</text>
    ${arrow(610, 402, 760, 402, { color: palette.orange })}<text x="685" y="378" font-family="Arial" font-size="14" font-weight="800" fill="${palette.orange}" text-anchor="middle">Comparer</text>
    <rect x="780" y="225" width="526" height="355" rx="24" fill="${palette.paper}" stroke="${palette.teal}" stroke-width="3"/><text x="1043" y="263" font-family="Arial" font-size="18" font-weight="850" fill="${palette.teal}" text-anchor="middle">2 · REPÈRE PROSTATIQUE</text>
    <ellipse cx="1043" cy="365" rx="118" ry="76" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="5"/><ellipse cx="1070" cy="384" rx="118" ry="76" fill="none" stroke="${palette.orange}" stroke-width="5" stroke-dasharray="11 8"/>${[[1005,350],[1080,350],[1045,398]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="${palette.charcoal}"/>`).join("")}<text x="1043" y="485" font-family="Arial" font-size="15" font-weight="750" fill="${palette.charcoal}" text-anchor="middle">Prostate / fiduciels ou CBCT</text><text x="1043" y="526" font-family="Arial" font-size="14" font-weight="700" fill="${palette.orange}" text-anchor="middle">Décalage possible après le match osseux</text>
    ${callout(70, 600, 1236, "Si les corrections divergent", "Appliquer les tolérances du protocole : ordre des recalages, couverture des deux cibles, reprise d’image/repositionnement et contrôle intrafraction documentés.", { stroke: palette.coral, fill: palette.paleCoral })}
  </g>`;
}

function planningAudit() {
  const rows = [
    ["Prescription", "intention · volumes · dose/fractionnement · systémique"],
    ["Contours", "CTV/PTV · OAR · fusion · version du référentiel"],
    ["Plan et QA", "couverture · maxima · contraintes · calcul · contrôle physique"],
    ["IGRT", "modalité · tolérances · intrafraction · conduite à tenir"],
  ];
  return `<g><rect x="130" y="205" width="1116" height="448" rx="26" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="4"/>
    ${rows.map(([label,detail],i)=>`<g><rect x="175" y="${242+i*88}" width="1026" height="68" rx="14" fill="${i%2?palette.paleBlue:palette.paleTeal}" stroke="${i%2?palette.blue:palette.teal}" stroke-width="2"/><rect x="200" y="${260+i*88}" width="30" height="30" rx="5" fill="${palette.white}" stroke="${palette.charcoal}" stroke-width="3"/><text x="255" y="${281+i*88}" font-family="Arial" font-size="18" font-weight="850" fill="${palette.charcoal}">${label}</text><text x="475" y="${281+i*88}" font-family="Arial" font-size="16" font-weight="650" fill="${palette.charcoal}">${detail}</text></g>`).join("")}
    <rect x="175" y="598" width="495" height="40" rx="20" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="3"/><text x="422" y="624" font-family="Arial" font-size="16" font-weight="850" fill="${palette.coral}" text-anchor="middle">Écart bloquant → corriger avant traitement</text><rect x="706" y="598" width="495" height="40" rx="20" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="3"/><text x="953" y="624" font-family="Arial" font-size="16" font-weight="850" fill="${palette.teal}" text-anchor="middle">Conforme + tracé → autorisation nominative</text>
  </g>`;
}

function renderPlanningLesson(lesson) {
  switch (lesson.id) {
    case "planning_01_simulation": return planningSimulation();
    case "planning_02_targets": return planningTargets();
    case "planning_03_oar": return planningOar();
    case "planning_04_dvh": return planningDvh();
    case "planning_05_igrt": return planningIgrt();
    case "planning_06_audit": return planningAudit();
    default: return null;
  }
}

function curveFrame({ x = 105, y = 245, w = 740, h = 350, xLabel = "Temps", yLabel = "Valeur", banner = "TRAJECTOIRES SCHÉMATIQUES · AUCUNE DONNÉE PATIENT" } = {}) {
  return `<rect x="${x - 35}" y="${y - 35}" width="${w + 70}" height="${h + 85}" rx="22" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="3"/>
    <rect x="${x - 15}" y="${y - 23}" width="390" height="28" rx="14" fill="${palette.paleOrange}"/><text x="${x + 180}" y="${y - 4}" font-family="Arial" font-size="13" font-weight="850" fill="${palette.orange}" text-anchor="middle">${escapeXml(banner)}</text>
    <line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="${palette.charcoal}" stroke-width="4" marker-end="url(#arrow)"/><line x1="${x}" y1="${y + h}" x2="${x}" y2="${y}" stroke="${palette.charcoal}" stroke-width="4" marker-end="url(#arrow)"/>
    <text x="${x + w}" y="${y + h + 32}" font-family="Arial" font-size="15" font-weight="750" fill="${palette.charcoal}" text-anchor="end">${escapeXml(xLabel)}</text><text x="${x - 50}" y="${y + 35}" font-family="Arial" font-size="15" font-weight="750" fill="${palette.charcoal}" transform="rotate(-90 ${x - 50} ${y + 35})" text-anchor="end">${escapeXml(yLabel)}</text>`;
}

function renderClinicalCurve(lesson) {
  if (lesson.id === "planning_04_dvh") return planningDvh();
  if (lesson.id === "followup_01_psa") return `<g>${curveFrame({ yLabel: "PSA (échelle qualitative)" })}
    <path d="M 135 300 C 210 430 250 535 330 570 L 800 570" fill="none" stroke="${palette.teal}" stroke-width="7"/><text x="360" y="552" font-family="Arial" font-size="15" font-weight="850" fill="${palette.teal}">Après prostatectomie : attendu indétectable</text>
    <path d="M 135 300 C 220 340 300 420 420 470 C 520 510 660 525 800 535" fill="none" stroke="${palette.blue}" stroke-width="6" stroke-dasharray="14 8"/><path d="M 530 520 Q 560 480 590 520 Q 620 555 650 520" fill="none" stroke="${palette.orange}" stroke-width="5"/><text x="500" y="450" font-family="Arial" font-size="15" font-weight="850" fill="${palette.blue}">Après RT : nadir plus lent</text><text x="610" y="480" font-family="Arial" font-size="14" font-weight="800" fill="${palette.orange}">rebond possible</text>
    ${callout(895, 245, 411, "Deux cadres différents", "Après chirurgie : persistance ou remontée après nadir. Après RT : prostate en place, fluctuations possibles et définition Phoenix.", { stroke: palette.teal, fill: palette.paleTeal })}${callout(895, 377, 411, "Imager si cela peut agir", "Cinétique, symptômes et possibilité de rattrapage précèdent le choix de l’examen.", { stroke: palette.blue, fill: palette.paleBlue })}${callout(895, 509, 411, "Piège", "Ne jamais appliquer Phoenix après prostatectomie ni exiger un PSA indétectable après RT.", { stroke: palette.coral, fill: palette.paleCoral })}</g>`;
  if (lesson.id === "followup_02_testosterone") return `<g>${curveFrame({ yLabel: "Testostérone (relative)", banner: "ÉVOLUTIONS POSSIBLES · PAS DE PRÉDICTION INDIVIDUELLE" })}
    <path d="M 135 560 C 270 550 340 430 475 335 C 585 265 690 270 800 270" fill="none" stroke="${palette.teal}" stroke-width="7"/><text x="640" y="250" font-family="Arial" font-size="15" font-weight="850" fill="${palette.teal}">Récupération plus complète</text>
    <path d="M 135 560 C 300 555 390 485 520 420 C 640 365 720 350 800 350" fill="none" stroke="${palette.blue}" stroke-width="6" stroke-dasharray="14 8"/><text x="650" y="398" font-family="Arial" font-size="15" font-weight="850" fill="${palette.blue}">Récupération lente</text>
    <path d="M 135 560 C 330 558 470 530 800 500" fill="none" stroke="${palette.orange}" stroke-width="6" stroke-dasharray="4 8"/><text x="605" y="530" font-family="Arial" font-size="15" font-weight="850" fill="${palette.orange}">Récupération incomplète</text>
    ${callout(895, 245, 411, "Déterminants", "Âge, niveau initial, durée et molécule d’ADT, comorbidités et fonction testiculaire.", { stroke: palette.teal, fill: palette.paleTeal })}${callout(895, 377, 411, "Lire ensemble", "Testostérone + PSA + fatigue, sexualité, humeur, muscle, métabolisme et os.", { stroke: palette.blue, fill: palette.paleBlue })}${callout(895, 509, 411, "Pas de date promise", "Une courbe pédagogique ne permet ni délai individuel ni supplémentation automatique.", { stroke: palette.coral, fill: palette.paleCoral })}</g>`;
  if (lesson.id === "postrp_01_definitions") return `<g>${curveFrame({ yLabel: "PSA (ng/mL, schématique)" })}
    <path d="M 135 300 C 210 430 245 555 320 570 L 800 570" fill="none" stroke="${palette.teal}" stroke-width="7"/><text x="455" y="552" font-family="Arial" font-size="15" font-weight="850" fill="${palette.teal}">Nadir indétectable attendu</text>
    <path d="M 135 300 C 210 420 245 485 320 500 L 800 500" fill="none" stroke="${palette.coral}" stroke-width="6" stroke-dasharray="14 8"/><text x="480" y="480" font-family="Arial" font-size="15" font-weight="850" fill="${palette.coral}">Persistance : jamais indétectable</text>
    <path d="M 135 300 C 210 430 245 555 320 570 L 520 570 C 620 560 700 500 800 390" fill="none" stroke="${palette.blue}" stroke-width="6"/><text x="635" y="370" font-family="Arial" font-size="15" font-weight="850" fill="${palette.blue}">Récidive : remontée après nadir</text>
    ${callout(895, 245, 411, "Définition opérationnelle", "Deux élévations consécutives > 0,2 ng/mL dans RecoRad ; vérifier dates, unités et répétition.", { stroke: palette.teal, fill: palette.paleTeal })}${callout(895, 377, 411, "Définir ≠ attendre", "Un seuil standardise le dossier mais ne fixe pas seul le meilleur moment d’un rattrapage.", { stroke: palette.blue, fill: palette.paleBlue })}${callout(895, 509, 411, "PSA ultrasensible", "Interpréter les très faibles valeurs avec prudence et dans le contexte anatomopathologique.", { stroke: palette.coral, fill: palette.paleCoral })}</g>`;
  if (lesson.id === "postrp_02_psadt") return `<g>${curveFrame({ yLabel: "ln(PSA)", banner: "MODÈLE DE PENTE · POINTS FICTIFS NON QUANTIFIÉS" })}
    <path d="M 150 555 L 780 300" fill="none" stroke="${palette.coral}" stroke-width="7"/><path d="M 150 555 L 780 455" fill="none" stroke="${palette.teal}" stroke-width="6" stroke-dasharray="14 8"/>${[[180,543],[300,495],[430,445],[560,390],[700,332]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="${palette.paper}" stroke="${palette.coral}" stroke-width="4"/>`).join("")}${[[180,550],[320,530],[470,505],[620,485],[760,458]].map(([x,y])=>`<rect x="${x-7}" y="${y-7}" width="14" height="14" fill="${palette.paper}" stroke="${palette.teal}" stroke-width="4"/>`).join("")}<text x="560" y="350" font-family="Arial" font-size="15" font-weight="850" fill="${palette.coral}">Pente plus forte → PSADT plus court</text><text x="570" y="520" font-family="Arial" font-size="15" font-weight="850" fill="${palette.teal}">Pente plus faible → PSADT plus long</text>
    ${callout(895, 245, 411, "Formule", "PSADT = ln(2) / pente de ln(PSA) en fonction du temps.", { stroke: palette.teal, fill: palette.paleTeal })}${callout(895, 377, 411, "Données nécessaires", "Plusieurs valeurs positives, datées, comparables ; fenêtre et laboratoire documentés.", { stroke: palette.blue, fill: palette.paleBlue })}${callout(895, 509, 411, "Interprétation", "Une cinétique courte augmente l’urgence d’évaluation mais ne prouve pas à elle seule une maladie métastatique.", { stroke: palette.coral, fill: palette.paleCoral })}</g>`;
  return null;
}

function targetGlyph(cx, cy, { gland = true, vesicles = false, pelvis = false, node = false, boost = false } = {}) {
  return `<g>${pelvis ? `<path d="M ${cx-105} ${cy-115} Q ${cx-155} ${cy} ${cx-105} ${cy+115} M ${cx+105} ${cy-115} Q ${cx+155} ${cy} ${cx+105} ${cy+115}" fill="none" stroke="${palette.blue}" stroke-width="13" stroke-linecap="round"/><path d="M ${cx-92} ${cy-74} Q ${cx-142} ${cy} ${cx-92} ${cy+75} M ${cx+92} ${cy-74} Q ${cx+142} ${cy} ${cx+92} ${cy+75}" fill="none" stroke="${palette.blue}" stroke-width="5" stroke-dasharray="9 7"/>` : ""}${vesicles ? `<ellipse cx="${cx-42}" cy="${cy-46}" rx="31" ry="18" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="4"/><ellipse cx="${cx+42}" cy="${cy-46}" rx="31" ry="18" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="4"/>` : ""}${gland ? `<path d="M ${cx-78} ${cy-10} Q ${cx} ${cy-62} ${cx+78} ${cy-10} L ${cx+65} ${cy+82} Q ${cx} ${cy+118} ${cx-65} ${cy+82} Z" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="5"/>` : ""}${boost ? `<path d="M ${cx+8} ${cy+5} q 35 -28 54 2 q -5 45 -48 48 q -27 -20 -6 -50" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="4"/>` : ""}${node ? `<circle cx="${cx+104}" cy="${cy-34}" r="20" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="5"/><circle cx="${cx+104}" cy="${cy-34}" r="7" fill="${palette.coral}"/>` : ""}</g>`;
}

function targetPanel(x, titleValue, subtitle, glyphOptions, color = palette.teal) {
  return `<g><rect x="${x}" y="230" width="370" height="392" rx="22" fill="${palette.paper}" stroke="${color}" stroke-width="3"/><text x="${x+185}" y="268" font-family="Arial" font-size="18" font-weight="850" fill="${color}" text-anchor="middle">${escapeXml(titleValue)}</text>${targetGlyph(x+185,395,glyphOptions)}${text(wrap(subtitle, 39, 4), x+28, 552, { size: 15, weight: 650, gap: 19 })}</g>`;
}

function renderClinicalTarget(lesson) {
  if (lesson.id === "planning_02_targets") return planningTargets();
  if (lesson.id === "definitive_rt_05_pelvis") return `<g>${targetPanel(70,"Faible / intermédiaire favorable","Prostate seule selon RecoRad ; ne pas ajouter pelvis ou vésicules par automatisme.",{gland:true},palette.teal)}${targetPanel(503,"Intermédiaire défavorable / haut risque","Prostate + base des vésicules selon risque ; vésicules complètes si T3b.",{gland:true,vesicles:true},palette.orange)}${targetPanel(936,"Décision pelvienne séparée","En cN0, documenter risque ganglionnaire, stadification, preuve, toxicité et règle du centre.",{gland:true,vesicles:true,pelvis:true},palette.blue)}<text x="688" y="660" font-family="Arial" font-size="14" font-weight="800" fill="${palette.coral}" text-anchor="middle">Le TEP-PSMA négatif n’exclut pas le microscopique et ne rend pas le pelvis obligatoire.</text></g>`;
  if (lesson.id === "definitive_rt_06_boost") return `<g>${targetPanel(70,"Escalade glandulaire","Dose augmentée à toute la prostate : bénéfice surtout biochimique ; contraintes OAR prioritaires.",{gland:true},palette.teal)}${targetPanel(503,"Boost focal externe","DIL définie par IRM, IMRT + IGRT ; cible nommée, distribution vérifiée, pas de bénéfice de survie affirmé.",{gland:true,boost:true},palette.coral)}${targetPanel(936,"Boost curiethérapique","Modalité, preuve et toxicité différentes : ne pas la confondre avec un boost focal externe.",{gland:true,boost:true},palette.orange)}<text x="688" y="660" font-family="Arial" font-size="14" font-weight="800" fill="${palette.charcoal}" text-anchor="middle">Trois intensifications différentes → trois prescriptions et trois arbitrages spécifiques.</text></g>`;
  if (lesson.id === "highrisk_04_cn1_m0") return `<g>${targetPanel(70,"Volumes locorégionaux","Prostate + pelvis ; distinguer volume électif et ganglion macroscopique.",{gland:true,vesicles:true,pelvis:true,node:true},palette.blue)}${targetPanel(503,"Boost ganglionnaire","Le ganglion visible reçoit un traitement distinct dans les limites des OAR et du protocole.",{gland:false,pelvis:true,node:true},palette.coral)}<rect x="936" y="230" width="370" height="392" rx="22" fill="${palette.paper}" stroke="${palette.orange}" stroke-width="3"/><text x="1121" y="270" font-family="Arial" font-size="18" font-weight="850" fill="${palette.orange}" text-anchor="middle">Traitement systémique</text>${roundedNode(991,315,260,75,"ADT longue",{fill:palette.paleTeal,stroke:palette.teal,size:20})}${arrow(1121,395,1121,435,{color:palette.orange})}${roundedNode(991,445,260,92,"+ 2 ans d’abiratérone selon EAU 2026",{fill:palette.paleOrange,stroke:palette.orange,size:18})}${text(wrap("Le cN1 moléculaire isolé reste une zone d’extrapolation à expliciter.",33,3),978,575,{size:15,weight:700,gap:19})}</g>`;
  if (lesson.id === "oligorec_02_nodal") return `<g>${targetPanel(70,"MDT focale","Traite le ou les ganglions visibles ; volume réduit mais risque de maladie microscopique voisine.",{gland:false,node:true},palette.coral)}${targetPanel(503,"Irradiation élective + boost","Traite les chaînes pelviennes à risque et renforce les ganglions détectés ; volume et toxicité plus grands.",{gland:false,pelvis:true,node:true},palette.blue)}<rect x="936" y="230" width="370" height="392" rx="22" fill="${palette.paper}" stroke="${palette.teal}" stroke-width="3"/><text x="1121" y="270" font-family="Arial" font-size="18" font-weight="850" fill="${palette.teal}" text-anchor="middle">Avant de choisir</text>${text(wrap("Territoire N1 ou M1a · nombre/taille · PSADT · hormonosensibilité · irradiation antérieure · dose cumulée · autres sites.",34,7),974,322,{size:17,weight:700,gap:23})}<rect x="974" y="520" width="294" height="70" rx="14" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="3"/>${text(wrap("PEACE V–STORM : signal de phase II, pas supériorité définitive.",32,3),994,548,{size:15,weight:800,gap:18})}</g>`;
  return null;
}

function renderClinicalDashboard(lesson) {
  const isPrevention = lesson.id === "systemic_05_prevention";
  const cards = isPrevention ? [
    ["Cardiométabolique", "Poids · pression · tabac · activité · glycémie/HbA1c · lipides", palette.blue],
    ["Os / chute", "Risque de chute · DMO selon contexte · calcium/vitamine D · fonction rénale", palette.teal],
    ["Intervenir", "Endurance + résistance · nutrition · sevrage · alcool · facteurs de risque", palette.orange],
    ["Urgence", "Douleur rachidienne + déficit neurologique ou trouble sphinctérien", palette.coral],
  ] : [
    ["Mesurer", "Poids/tour de taille · pression · tabac · activité · glycémie/HbA1c · lipides", palette.blue],
    ["Relier", "ADT/ARPI · antécédents CV · composition corporelle · diabète · HTA", palette.teal],
    ["Agir", "Exercice aérobie + résistance · alimentation · sevrage · traitements validés", palette.orange],
    ["Alerte", "Dyspnée · douleur thoracique · syncope · œdème nouveau → évaluation rapide", palette.coral],
  ];
  return `<g>${cards.map(([titleValue,detail,color],i)=>{const x=70+(i%2)*628,y=225+Math.floor(i/2)*205;return `<rect x="${x}" y="${y}" width="578" height="170" rx="22" fill="${i%2?palette.paper:palette.paleTeal}" stroke="${color}" stroke-width="3"/><text x="${x+28}" y="${y+42}" font-family="Arial" font-size="20" font-weight="850" fill="${color}">${titleValue}</text>${text(wrap(detail,55,4),x+28,y+82,{size:17,weight:650,gap:22})}`}).join("")}<text x="688" y="655" font-family="Arial" font-size="14" font-weight="800" fill="${palette.charcoal}" text-anchor="middle">Une mesure sans responsable, action ni réévaluation n’est pas une prévention.</text></g>`;
}

function renderNodalPrediction() {
  return `<g><rect x="70" y="250" width="300" height="300" rx="24" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="3"/><text x="220" y="289" font-family="Arial" font-size="19" font-weight="850" fill="${palette.blue}" text-anchor="middle">ENTRÉES</text>${text(["PSA","cT","groupe ISUP","charge biopsique","± variables IRM"],115,335,{size:18,weight:700,gap:38})}${arrow(390,400,520,400,{color:palette.teal})}<rect x="540" y="285" width="296" height="230" rx="24" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="4"/><text x="688" y="333" font-family="Arial" font-size="19" font-weight="850" fill="${palette.teal}" text-anchor="middle">NOMOGRAMME IDENTIFIÉ</text>${text(["modèle + version","population de validation","données saisies","seuil lié à la question"],688,380,{size:17,weight:700,anchor:"middle",gap:34})}${arrow(856,400,986,400,{color:palette.orange})}<rect x="1006" y="250" width="300" height="300" rx="24" fill="${palette.paleOrange}" stroke="${palette.orange}" stroke-width="3"/><text x="1156" y="289" font-family="Arial" font-size="19" font-weight="850" fill="${palette.orange}" text-anchor="middle">SORTIE</text>${text(["Probabilité prétest","≠ ganglion visible","≠ cN / pN","≠ indication automatique","de pelvis ou systémique"],1156,338,{size:18,weight:750,anchor:"middle",gap:38})}<rect x="245" y="585" width="886" height="58" rx="18" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="3"/><text x="688" y="620" font-family="Arial" font-size="17" font-weight="850" fill="${palette.coral}" text-anchor="middle">Une imagerie négative ne ramène pas le risque à zéro ; la pathologie reste une information différente.</text></g>`;
}

function renderClinicalLayered(lesson) {
  if (lesson.id === "localized_03_ebrt") return `<g><rect x="70" y="230" width="1236" height="392" rx="24" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="3"/><line x1="482" y1="230" x2="482" y2="622" stroke="${palette.grid}" stroke-width="3"/><line x1="894" y1="230" x2="894" y2="622" stroke="${palette.grid}" stroke-width="3"/>
    <text x="276" y="270" font-family="Arial" font-size="20" font-weight="850" fill="${palette.teal}" text-anchor="middle">FAIBLE RISQUE</text>${targetGlyph(276,390,{gland:true})}${text(wrap("Surveillance active standard si éligible ; RT curative si traitement choisi. Prostate seule.",34,4),112,530,{size:16,weight:650,gap:21})}
    <text x="688" y="270" font-family="Arial" font-size="20" font-weight="850" fill="${palette.orange}" text-anchor="middle">INTERMÉDIAIRE</text>${targetGlyph(688,390,{gland:true,vesicles:true})}${text(wrap("Volumes et éventuelle ADT dépendent du profil favorable/défavorable ; ne pas uniformiser.",34,4),524,530,{size:16,weight:650,gap:21})}
    <text x="1100" y="270" font-family="Arial" font-size="20" font-weight="850" fill="${palette.blue}" text-anchor="middle">HAUT RISQUE</text>${targetGlyph(1100,390,{gland:true,vesicles:true,pelvis:true})}${text(wrap("Prostate, vésicules et éventuel pelvis + ADT selon indication, preuve et référentiel.",34,4),936,530,{size:16,weight:650,gap:21})}</g>`;
  if (lesson.id === "staging_01_tnm") return `<g>${[[70,"T","Tumeur primitive","cT clinique (toucher rectal selon convention EAU) · extension IRM consignée séparément",palette.teal],[492,"N","Ganglions régionaux","cN par imagerie/clinique ; pN seulement par anatomopathologie des prélèvements",palette.blue],[914,"M","Métastases à distance","M0/M1 selon bilan ; méthode d’imagerie et niveau de certitude explicités",palette.orange]].map(([x,letter,titleValue,detail,color])=>`<rect x="${x}" y="230" width="372" height="390" rx="24" fill="${palette.paper}" stroke="${color}" stroke-width="4"/><circle cx="${x+70}" cy="305" r="42" fill="${color}"/><text x="${x+70}" y="319" font-family="Arial" font-size="36" font-weight="900" fill="${palette.white}" text-anchor="middle">${letter}</text><text x="${x+132}" y="312" font-family="Arial" font-size="20" font-weight="850" fill="${color}">${titleValue}</text>${text(wrap(detail,34,7),x+32,385,{size:17,weight:650,gap:24})}`).join("")}<text x="688" y="659" font-family="Arial" font-size="14" font-weight="850" fill="${palette.coral}" text-anchor="middle">TNM = étendue anatomique ; il ne résume ni ISUP, ni risque de rechute, ni aptitude du patient.</text></g>`;
  return null;
}

function renderClinicalAnatomy(lesson) {
  if (lesson.id.startsWith("planning_")) return renderPlanningLesson(lesson);
  if (lesson.id === "special_02_ibd") return `<g><rect x="70" y="220" width="520" height="410" rx="24" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="3"/><text x="330" y="255" font-family="Arial" font-size="17" font-weight="850" fill="${palette.muted}" text-anchor="middle">TOPOGRAPHIE DIGESTIVE SCHÉMATIQUE</text><path d="M 190 330 Q 160 280 225 275 L 440 275 Q 505 280 470 335 L 470 500 Q 470 555 410 555 L 245 555 Q 190 555 190 500 Z" fill="none" stroke="${palette.blue}" stroke-width="28" stroke-linecap="round"/><path d="M 455 405 Q 480 450 450 505" fill="none" stroke="${palette.coral}" stroke-width="28" stroke-linecap="round"/><circle cx="452" cy="455" r="32" fill="none" stroke="${palette.orange}" stroke-width="6" stroke-dasharray="8 6"/><text x="330" y="595" font-family="Arial" font-size="15" font-weight="800" fill="${palette.coral}" text-anchor="middle">Segment actif / sténose / anastomose à localiser</text>${callout(630,220,676,"1 · Activité et anatomie", "Type de MICI, activité récente, symptômes, biologie/endoscopie utile, chirurgie, sténose ou fistule.",{stroke:palette.coral,fill:palette.paleCoral})}${callout(630,352,676,"2 · Volume exposé", "Distinguer rectum, canal anal, anses et bowel bag ; antécédents pelviens et topographie comptent.",{stroke:palette.blue,fill:palette.paleBlue})}${callout(630,484,676,"3 · Réduire le risque", "Préparation reproductible, modulation/IGRT, contraintes concordantes, gastro-entérologie et surveillance renforcée.",{stroke:palette.teal,fill:palette.paleTeal})}</g>`;
  if (lesson.id === "special_03_turp") return `<g><rect x="70" y="220" width="560" height="410" rx="24" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="3"/><ellipse cx="350" cy="308" rx="105" ry="55" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="5"/><text x="350" y="314" font-family="Arial" font-size="16" font-weight="800" fill="${palette.charcoal}" text-anchor="middle">Vessie / col</text><path d="M 230 420 Q 350 340 470 420 L 450 545 Q 350 610 250 545 Z" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="5"/><path d="M 321 415 Q 350 380 379 415 L 388 505 Q 350 535 312 505 Z" fill="${palette.ivory}" stroke="${palette.coral}" stroke-width="5" stroke-dasharray="9 6"/><line x1="350" y1="365" x2="350" y2="590" stroke="${palette.orange}" stroke-width="7"/><text x="396" y="477" font-family="Arial" font-size="15" font-weight="850" fill="${palette.coral}">Cavité TURP</text><text x="365" y="575" font-family="Arial" font-size="14" font-weight="750" fill="${palette.orange}">Urètre / sphincter</text>${callout(670,220,636,"Avant RT", "Date et étendue de la résection, cicatrisation, continence, obstruction, infection et débit urinaire.",{stroke:palette.blue,fill:palette.paleBlue})}${callout(670,352,636,"Au contourage", "Visualiser col, urètre, sphincter et cavité si la technique/protocole le prévoit ; ne pas inventer de contrainte.",{stroke:palette.teal,fill:palette.paleTeal})}${callout(670,484,636,"Arbitrage", "Risque urinaire dépend de l’anatomie résiduelle, des symptômes, de la dose et du délai ; plan individualisé.",{stroke:palette.coral,fill:palette.paleCoral})}</g>`;
  if (lesson.id === "followup_03_urinary") return `<g><rect x="70" y="220" width="520" height="410" rx="24" fill="${palette.paper}" stroke="${palette.blue}" stroke-width="3"/><ellipse cx="330" cy="325" rx="110" ry="72" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="5"/><text x="330" y="332" font-family="Arial" font-size="18" font-weight="850" fill="${palette.charcoal}" text-anchor="middle">Vessie</text><line x1="330" y1="397" x2="330" y2="555" stroke="${palette.orange}" stroke-width="10"/><ellipse cx="330" cy="430" rx="45" ry="25" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="4"/><text x="347" y="520" font-family="Arial" font-size="15" font-weight="800" fill="${palette.orange}">Urètre</text>${callout(630,220,676,"Symptôme", "Irritatif, obstructif, incontinence, douleur ou hématurie ; grade, temporalité et retentissement.",{stroke:palette.blue,fill:palette.paleBlue})}${callout(630,352,676,"Mécanisme possible", "Inflammation, sténose, obstruction, infection, dysfonction vésicale ou séquelle sphinctérienne : ne pas tout attribuer à la RT.",{stroke:palette.orange,fill:palette.paleOrange})}${callout(630,484,676,"Évaluer puis agir", "ECBU, débit/résidu, endoscopie ou imagerie selon le signal ; hématurie macroscopique/rétention = évaluation rapide.",{stroke:palette.coral,fill:palette.paleCoral})}</g>`;
  if (lesson.id === "followup_04_bowel") return `<g><rect x="70" y="220" width="520" height="410" rx="24" fill="${palette.paper}" stroke="${palette.coral}" stroke-width="3"/><path d="M 290 270 Q 390 260 420 330 L 410 480 Q 400 555 330 590 Q 260 555 250 480 L 240 330 Q 260 280 290 270" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="6"/><line x1="330" y1="325" x2="330" y2="565" stroke="${palette.paper}" stroke-width="18"/><text x="330" y="610" font-family="Arial" font-size="16" font-weight="850" fill="${palette.coral}" text-anchor="middle">Rectum → canal anal</text>${callout(630,220,676,"Phénotype", "Urgence, fréquence, mucus, douleur, incontinence, ténesme ou saignement ; préciser chronologie et grade.",{stroke:palette.coral,fill:palette.paleCoral})}${callout(630,352,676,"Chercher une cause", "Infection, MICI, médicament, hémorroïdes, néoplasie ou autre cause digestive restent possibles.",{stroke:palette.orange,fill:palette.paleOrange})}${callout(630,484,676,"Signal d’alarme", "Saignement important, anémie, douleur, amaigrissement ou modification persistante → exploration adaptée, pas diagnostic par défaut.",{stroke:palette.blue,fill:palette.paleBlue})}</g>`;
  if (lesson.id === "postrp_06_technique") return `<g><rect x="70" y="220" width="610" height="410" rx="24" fill="${palette.paper}" stroke="${palette.charcoal}" stroke-width="3"/><ellipse cx="375" cy="305" rx="108" ry="62" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="5"/><text x="375" y="312" font-family="Arial" font-size="17" font-weight="850" fill="${palette.charcoal}" text-anchor="middle">Vessie</text><line x1="375" y1="365" x2="375" y2="575" stroke="${palette.orange}" stroke-width="8"/><circle cx="375" cy="405" r="20" fill="${palette.white}" stroke="${palette.coral}" stroke-width="5"/><path d="M 270 390 Q 375 330 480 390 L 455 520 Q 375 565 295 520 Z" fill="none" stroke="${palette.teal}" stroke-width="6" stroke-dasharray="12 8"/><text x="495" y="420" font-family="Arial" font-size="15" font-weight="850" fill="${palette.teal}">Lit prostatique / CTV</text><text x="402" y="447" font-family="Arial" font-size="14" font-weight="800" fill="${palette.coral}">Anastomose</text><ellipse cx="375" cy="580" rx="92" ry="25" fill="${palette.paleCoral}" stroke="${palette.coral}" stroke-width="4"/><text x="375" y="616" font-family="Arial" font-size="14" font-weight="750" fill="${palette.coral}" text-anchor="middle">Rectum postérieur</text>${callout(720,220,586,"Glande absente", "Le CTV du lit repose sur l’anatomie postopératoire, les clips, le compte rendu et un atlas identifié.",{stroke:palette.teal,fill:palette.paleTeal})}${callout(720,352,586,"Zones de vigilance", "Anastomose vésico-urétrale, col vésical, loge des vésicules, apex et extension selon pT/marges.",{stroke:palette.blue,fill:palette.paleBlue})}${callout(720,484,586,"Technique", "PTV, préparation et IGRT suivent les incertitudes du workflow ; ne pas dessiner une ‘prostate fantôme’.",{stroke:palette.coral,fill:palette.paleCoral})}</g>`;
  return null;
}

function renderHipArtifact() {
  return `<g><rect x="70" y="230" width="350" height="370" rx="22" fill="${palette.paper}" stroke="${palette.blue}" stroke-width="3"/><text x="245" y="270" font-family="Arial" font-size="18" font-weight="850" fill="${palette.blue}" text-anchor="middle">1 · IMAGERIE</text><circle cx="245" cy="400" r="72" fill="${palette.paleBlue}" stroke="${palette.blue}" stroke-width="5"/><circle cx="292" cy="418" r="28" fill="${palette.charcoal}"/><path d="M 292 418 L 120 300 M 292 418 L 390 320 M 292 418 L 405 535 M 292 418 L 135 560" stroke="${palette.orange}" stroke-width="10" opacity=".6"/><text x="245" y="565" font-family="Arial" font-size="15" font-weight="750" fill="${palette.orange}" text-anchor="middle">Artefacts → contours/densités incertains</text>${arrow(440,415,505,415,{color:palette.teal})}<rect x="525" y="230" width="350" height="370" rx="22" fill="${palette.paper}" stroke="${palette.teal}" stroke-width="3"/><text x="700" y="270" font-family="Arial" font-size="18" font-weight="850" fill="${palette.teal}" text-anchor="middle">2 · CALCUL</text>${roundedNode(585,315,230,75,"Correction d’artefact",{fill:palette.paleTeal,stroke:palette.teal,size:17})}${arrow(700,400,700,445,{color:palette.teal})}${roundedNode(585,465,230,80,"Densité / algorithme validés",{fill:palette.paleBlue,stroke:palette.blue,size:17})}<text x="700" y="575" font-family="Arial" font-size="15" font-weight="750" fill="${palette.charcoal}" text-anchor="middle">Incertitude explicitée</text>${arrow(895,415,960,415,{color:palette.orange})}<rect x="980" y="230" width="326" height="370" rx="22" fill="${palette.paper}" stroke="${palette.orange}" stroke-width="3"/><text x="1143" y="270" font-family="Arial" font-size="18" font-weight="850" fill="${palette.orange}" text-anchor="middle">3 · FAISCEAUX / QA</text><circle cx="1143" cy="420" r="72" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="5"/><circle cx="1190" cy="438" r="28" fill="${palette.charcoal}"/><path d="M 1035 340 L 1100 382 M 1040 520 L 1100 458 M 1255 330 L 1215 386" stroke="${palette.blue}" stroke-width="9" marker-end="url(#arrow)"/><path d="M 1270 510 L 1205 465" stroke="${palette.coral}" stroke-width="9" stroke-dasharray="8 7"/><text x="1143" y="565" font-family="Arial" font-size="15" font-weight="750" fill="${palette.charcoal}" text-anchor="middle">Éviter le métal si robuste ; vérifier dose et délivrance</text></g>`;
}

function pathwayNode(x, y, w, label, detail, { stroke = palette.teal, fill = palette.paper } = {}) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="130" rx="20" fill="${fill}" stroke="${stroke}" stroke-width="3"/>${text(wrap(label,Math.floor(w/13),2),x+w/2,y+38,{size:18,weight:850,fill:stroke,anchor:"middle",gap:21})}${text(wrap(detail,Math.floor(w/10.5),3),x+20,y+78,{size:14,weight:650,gap:18})}</g>`;
}

function renderClinicalMolecular(lesson) {
  if (lesson.id === "mcrpc_02_testing") return `<g>${pathwayNode(70,250,260,"Question 1","Prédisposition transmissible → test germinal + conseil adapté.",{stroke:palette.blue,fill:palette.paleBlue})}${pathwayNode(70,430,260,"Question 2","Altération tumorale actionnable → tissu et/ou ADN tumoral circulant.",{stroke:palette.teal,fill:palette.paleTeal})}${arrow(350,315,485,315,{color:palette.blue})}${arrow(350,495,485,495,{color:palette.teal})}${pathwayNode(505,340,360,"Contrôle pré-analytique","Ancienneté/qualité du tissu · fraction tumorale · panel · traitement intermédiaire.",{stroke:palette.orange,fill:palette.paleOrange})}${arrow(885,405,1000,405,{color:palette.orange})}${pathwayNode(1020,340,286,"Interprétation","Actionnable · vrai négatif · ou non informatif → autre matrice/rebiopsie à discuter.",{stroke:palette.coral,fill:palette.paleCoral})}<text x="688" y="625" font-family="Arial" font-size="15" font-weight="850" fill="${palette.coral}" text-anchor="middle">« Non informatif » n’est pas synonyme de « aucune altération ».</text></g>`;
  if (lesson.id === "mcrpc_03_parp") return `<g>${pathwayNode(70,330,270,"Altération HRR","Nommer le gène, la méthode et, si connu, le statut mono-/biallélique.",{stroke:palette.blue,fill:palette.paleBlue})}${arrow(360,395,480,395,{color:palette.blue})}${pathwayNode(500,245,340,"Signal le plus robuste","BRCA1/2, particulièrement BRCA2 : preuve généralement plus solide.",{stroke:palette.teal,fill:palette.paleTeal})}${pathwayNode(500,445,340,"Autres gènes HRR","Amplitude du bénéfice plus incertaine : ne pas homogénéiser « HRR+ ».",{stroke:palette.orange,fill:palette.paleOrange})}${arrow(860,310,980,375,{color:palette.teal})}${arrow(860,510,980,430,{color:palette.orange})}${pathwayNode(1000,330,306,"Décision précise","Molécule · mono/combinaison · ligne · exposition ARPI · toxicité hématologique.",{stroke:palette.coral,fill:palette.paleCoral})}<text x="688" y="625" font-family="Arial" font-size="15" font-weight="850" fill="${palette.charcoal}" text-anchor="middle">Biomarqueur × séquence × molécule × réserves médullaires : les quatre doivent concordent.</text></g>`;
  if (lesson.id === "mcrpc_06_lutetium") return `<g>${pathwayNode(70,330,270,"TEP-PSMA","Expression suffisante + hétérogénéité interlésionnelle selon la stratégie.",{stroke:palette.teal,fill:palette.paleTeal})}${arrow(360,395,455,395,{color:palette.teal})}${pathwayNode(475,330,270,"Imagerie complète","Rechercher une maladie dominante incompatible, pas seulement une lésion très avide.",{stroke:palette.blue,fill:palette.paleBlue})}${arrow(765,395,860,395,{color:palette.blue})}${pathwayNode(880,255,426,"Éligibilité clinique/biologique","Ligne · ARPI/taxane · état général · moelle · rein · xérostomie · logistique/radioprotection.",{stroke:palette.orange,fill:palette.paleOrange})}${pathwayNode(880,455,426,"Cadre d’accès","Critères de l’essai/recommandation, autorisation et accès français du moment.",{stroke:palette.coral,fill:palette.paleCoral})}<text x="688" y="625" font-family="Arial" font-size="15" font-weight="850" fill="${palette.coral}" text-anchor="middle">Une seule lésion PSMA-avid ne suffit jamais à déclarer l’éligibilité.</text></g>`;
  return null;
}

const bodySpecs = {
  followup_05_sexual: ["Santé sexuelle", [
    ["Domaines", "Désir · érection · orgasme/éjaculation · douleur · continence · image corporelle · relation"],
    ["Causes multiples", "ADT · chirurgie · RT · âge · diabète · médicaments · état psychologique"],
    ["Options progressives", "Information · PDE5 si approprié · vacuum · injections · sexologie · prothèse"],
    ["Préférence", "Consentement, objectif et place éventuelle du partenaire guident le parcours"],
  ]],
  followup_06_bone: ["Fragilité osseuse", [
    ["Risque", "Durée ADT · âge · fracture/chute · corticoïdes · tabac/alcool · DMO"],
    ["Mesurer", "DXA initiale si ADT prolongée ; répétition selon résultat et trajectoire"],
    ["Prévenir", "Exercice porteur/résistance · chutes · protéines/calcium · vitamine D si carence"],
    ["Traiter si indiqué", "Avant anti-résorptif : dents · calcémie · rein · arrêt/relais anticipé"],
  ]],
  followup_08_psychosocial: ["Après-cancer", [
    ["Dépister", "Peur de récidive · détresse PSA · dépression · fatigue · isolement"],
    ["Vie réelle", "Couple · travail · finances · autonomie · priorités du patient"],
    ["PPAC", "Calendrier · responsables · alertes · prévention · réhabilitation · relais"],
    ["Urgence", "Idées suicidaires · violence · perte d’autonomie → réponse immédiate adaptée"],
  ]],
  hspc_04_bone: ["Atteinte osseuse", [
    ["Urgence", "Rachis douloureux + déficit/sphincters · fracture imminente · hypercalcémie"],
    ["Objectif local", "RT palliative pour douleur/risque ; chirurgie/stabilisation pour instabilité"],
    ["État de maladie", "mHSPC ≠ mCRPC : ne pas transposer automatiquement l’anti-résorptif oncologique"],
    ["Fragilité", "Le risque lié à l’ADT reste évalué chez tous, indépendamment du stade"],
  ]],
  mcrpc_05_radium: ["Radium-223", [
    ["Phénotype", "mCRPC osseux sélectionné · absence de métastase viscérale dominante"],
    ["Symptômes / indication", "Contexte et recommandation applicables ; pas un traitement général du mCRPC"],
    ["Moelle", "NFS et réserve médullaire avant et pendant le parcours"],
    ["Protection osseuse", "Risque fracturaire · anti-résorptif approprié · santé dentaire · associations validées"],
  ]],
  mcrpc_10_palliative_rt: ["RT palliative", [
    ["Objectif", "Douleur · saignement · obstruction · masse compressive · risque neurologique"],
    ["Triage", "Compression médullaire/obstruction urgente : ne pas attendre la ligne suivante"],
    ["Prescription", "Site · stabilité · pronostic · irradiation antérieure · logistique"],
    ["Coordination", "Chirurgie · RT · corticothérapie · analgésie · soins de support selon anatomie"],
  ]],
  oligorec_04_mdt_rt: ["MDT multi-sites", [
    ["Stadifier", "Imagerie récente ; traiter toutes les cibles pertinentes, pas une fixation équivoque"],
    ["Planifier chaque site", "Corrélation anatomique · GTV/CTV · mouvement · OAR · IGRT"],
    ["Cumuler honnêtement", "Importer anciens plans · recalage/déformation · dose cumulée + incertitudes"],
    ["Après RT", "PSA/testostérone · toxicité · imagerie conditionnelle · progression · stratégie systémique"],
  ]],
};

function renderClinicalBody(lesson) {
  const spec = bodySpecs[lesson.id];
  if (!spec) return null;
  const [center, cards] = spec;
  const positions = [[70,225],[866,225],[70,472],[866,472]];
  const colors = [palette.blue,palette.teal,palette.orange,palette.coral];
  const connectors = ["M 415 320 C 515 320 535 365 595 385","M 961 320 C 861 320 841 365 781 385","M 415 557 C 515 557 535 505 595 465","M 961 557 C 861 557 841 505 781 465"].map((d,i)=>curvedArrow(d,{color:colors[i]})).join("");
  return `<g>${connectors}${cards.map(([titleValue,detail],i)=>{const [x,y]=positions[i];return `<rect x="${x}" y="${y}" width="345" height="170" rx="22" fill="${i%2?palette.paper:palette.paleTeal}" stroke="${colors[i]}" stroke-width="3"/><text x="${x+24}" y="${y+40}" font-family="Arial" font-size="19" font-weight="850" fill="${colors[i]}">${escapeXml(titleValue)}</text>${text(wrap(detail,34,5),x+24,y+78,{size:15,weight:650,gap:20})}`}).join("")}<circle cx="688" cy="425" r="122" fill="${palette.ivory}" stroke="${palette.charcoal}" stroke-width="5"/><circle cx="688" cy="380" r="32" fill="${palette.paleTeal}" stroke="${palette.teal}" stroke-width="4"/><path d="M 688 415 V 485 M 644 438 L 688 452 L 732 438 M 688 485 L 655 530 M 688 485 L 721 530" fill="none" stroke="${palette.charcoal}" stroke-width="13" stroke-linecap="round"/><text x="688" y="580" font-family="Arial" font-size="18" font-weight="850" fill="${palette.charcoal}" text-anchor="middle">${escapeXml(center)}</text></g>`;
}

function regimenCard(x, titleValue, dose, detail, color) {
  return `<g><rect x="${x}" y="235" width="370" height="355" rx="24" fill="${palette.paper}" stroke="${color}" stroke-width="4"/><text x="${x+185}" y="278" font-family="Arial" font-size="18" font-weight="850" fill="${color}" text-anchor="middle">${escapeXml(titleValue)}</text><rect x="${x+45}" y="310" width="280" height="82" rx="18" fill="${color}"/><text x="${x+185}" y="361" font-family="Arial" font-size="27" font-weight="900" fill="${palette.white}" text-anchor="middle">${escapeXml(dose)}</text>${text(wrap(detail,36,6),x+32,450,{size:16,weight:650,gap:22})}</g>`;
}

function renderClinicalCalendar(lesson) {
  if (lesson.id === "definitive_rt_02_moderate_hypofractionation") return `<g>${regimenCard(70,"Ancre française/européenne","60 Gy / 20 fx","Environ 4 semaines · IMRT/VMAT · IGRT quotidienne · contraintes et volumes du protocole.",palette.teal)}${regimenCard(503,"Plage RecoRad","60–62 Gy / 20 fx","Population et volumes concordants ; un schéma prostate seule ne justifie pas le pelvis.",palette.blue)}${regimenCard(936,"Haut risque — divergence","68 Gy / 25 fx","Option RecoRad parmi d’autres ; CCAFU plus prudent. Citer la recommandation et le protocole local.",palette.orange)}<text x="688" y="635" font-family="Arial" font-size="15" font-weight="850" fill="${palette.coral}" text-anchor="middle">Un nombre de fractions seul n’est jamais une prescription complète.</text></g>`;
  if (lesson.id === "definitive_rt_03_sbrt") return `<g>${regimenCard(70,"Schéma le plus documenté","36,25 Gy / 5 fx","Environ 2 semaines · prostate seule · conditions stéréotaxiques · IGRT et préparation robustes.",palette.teal)}${regimenCard(503,"Autre schéma cité EAU","42,7 Gy / 7 fx","Pour certains risques intermédiaires favorables ; rattacher au protocole source exact.",palette.blue)}${regimenCard(936,"Ne pas extrapoler","Haut risque / pelvis","Reste en évaluation dans les référentiels français cités ; ne valide ni pelvis ultra-hypofractionné ni omission de l’ADT.",palette.coral)}<text x="688" y="635" font-family="Arial" font-size="15" font-weight="850" fill="${palette.orange}" text-anchor="middle">Fonction urinaire, obstacle, OAR et workflow stéréotaxique précèdent le gain de temps.</text></g>`;
  if (lesson.id === "postrp_05_adt") return `<g>${regimenCard(70,"Pas automatique","RT seule possible","Le PSA détectable isolé ne suffit pas : intégrer niveau, PSADT, ISUP, pT/pN, marges, persistance et imagerie.",palette.teal)}${regimenCard(503,"Profil défavorable","≈ 6 mois","Repère RecoRad notamment si PSA > 0,5 ng/mL ou PSADT < 6 mois ; validation médicale requise.",palette.orange)}${regimenCard(936,"Situation sélectionnée","≈ 24 mois","Discussion possible notamment pN1 ou PSA > 1 ng/mL ; ne pas transposer sans contexte ni preuve actualisée.",palette.coral)}<text x="688" y="635" font-family="Arial" font-size="15" font-weight="850" fill="${palette.charcoal}" text-anchor="middle">Avant ADT : risques cardiovasculaire, métabolique, osseux et sexuel + préférences + plan de prévention.</text></g>`;
  if (lesson.id === "systemic_04_taxanes") return `<g><text x="688" y="215" font-family="Arial" font-size="15" font-weight="850" fill="${palette.muted}" text-anchor="middle">CYCLE RÉPÉTÉ UNIQUEMENT SI BÉNÉFICE–RISQUE RESTE FAVORABLE</text>${roundedNode(80,345,250,120,"Séquence + bénéfice attendu",{fill:palette.paleBlue,stroke:palette.blue,size:19})}${arrow(350,405,455,405,{color:palette.blue})}${roundedNode(475,345,250,120,"Fitness + moelle + foie + neuropathie",{fill:palette.paleTeal,stroke:palette.teal,size:18})}${arrow(745,405,850,405,{color:palette.teal})}${roundedNode(870,345,210,120,"Docétaxel ou cabazitaxel selon contexte",{fill:palette.paleOrange,stroke:palette.orange,size:18})}${arrow(1100,405,1180,405,{color:palette.orange})}${roundedNode(1190,345,116,120,"Cycle",{fill:palette.paleCoral,stroke:palette.coral,size:20})}${curvedArrow("M 1245 485 C 1180 610 420 640 210 490",{color:palette.coral,dashed:true})}${text(wrap("Avant chaque cycle : toxicités, infection/fièvre, réserves, réponse, préférence et alternatives ; prophylaxie G-CSF selon protocole et risque.",105,2),688,575,{size:16,weight:750,anchor:"middle",gap:22})}</g>`;
  return null;
}

function renderForType(type, items, lesson) {
  const planningBody = renderPlanningLesson(lesson);
  if (planningBody) return planningBody;
  const clinicalCurve = type === "curve" ? renderClinicalCurve(lesson) : null;
  if (clinicalCurve) return clinicalCurve;
  const clinicalTarget = type === "target-map" ? renderClinicalTarget(lesson) : null;
  if (clinicalTarget) return clinicalTarget;
  if (type === "dashboard") return renderClinicalDashboard(lesson);
  if (type === "gauge" && lesson.id === "staging_05_nodal_prediction") return renderNodalPrediction();
  const clinicalLayered = type === "layered-map" ? renderClinicalLayered(lesson) : null;
  if (clinicalLayered) return clinicalLayered;
  const clinicalAnatomy = type === "anatomy-map" ? renderClinicalAnatomy(lesson) : null;
  if (clinicalAnatomy) return clinicalAnatomy;
  if (type === "motion-map" && lesson.id === "special_04_hip") return renderHipArtifact();
  const clinicalMolecular = type === "molecular-pathway" ? renderClinicalMolecular(lesson) : null;
  if (clinicalMolecular) return clinicalMolecular;
  const clinicalBody = type === "body-map" ? renderClinicalBody(lesson) : null;
  if (clinicalBody) return clinicalBody;
  const clinicalCalendar = type === "treatment-calendar" ? renderClinicalCalendar(lesson) : null;
  if (clinicalCalendar) return clinicalCalendar;
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
  const scientificItems = items?.length ? items : buildScientificItems(lesson);
  const labels = scientificItems.map((item) => item.label);
  return {
    kind: typeToKind[assignment.type],
    diagramType: assignment.type,
    formatLabel: assignment.label,
    title: lesson.title,
    imageSrc,
    altText: `${assignment.label} pour « ${lesson.title} ». Le schéma relie ${labels.join(" ; ")} sans représenter de données patient ni remplacer le protocole source.`,
    caption: `${assignment.label} : ${labels.join(" · ")}. Représentation pédagogique, non à l’échelle et sans donnée patient. Sources et limites précisées dans la leçon.`,
    items: scientificItems,
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
    { id: "lesson_specific_direction", label: `Affectation explicite ${assignment.type} dans visual_plan.json`, passed: true },
    { id: "dimensions_16_9", label: "Canevas SVG 1376 × 768", passed: true },
    { id: "accessible_metadata", label: "Titre, description et repli textuel", passed: visual.altText.length >= 80 && visual.items.length === 4 },
    { id: "unique_fallback", label: "Les quatre repères textuels ont des détails distincts", passed: new Set(visual.items.map((item) => item.detail)).size === visual.items.length },
    { id: "source_traceability", label: "Leçon reliée à des sources contrôlées", passed: lesson.sources?.length > 0 },
    { id: "no_patient_data_claim", label: "La légende explicite l’absence de données patient", passed: visual.caption.includes("sans donnée patient") },
    { id: "release_gate", label: "Revue clinique nominative signalée sans badge technique visible", passed: visual.caption.includes("nominative") && !visual.caption.includes("needs_review") },
  ];
  return {
    scope: "Précontrôle déterministe de structure, traçabilité et garde-fous. Il ne juge pas la vérité clinique et ne constitue pas une validation clinique.",
    passed: checks.every((check) => check.passed),
    checks,
    numericQualityScore: null,
    clinicalMeaningReviewedByAutomation: false,
  };
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
      const visual = {
        ...buildVisualMetadata(lesson, buildScientificItems(lesson), existing.imageSrc),
        placement: existing.placement,
        ...(existing.afterSection ? { afterSection: existing.afterSection } : {}),
      };
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
