// Capas dos 5 módulos da área de membros da Kiwify (600x900, vertical 2:3), com material real do kit.
// Uso: node build.mjs kit-aplicacao templates-editaveis && node oferta/capas_modulos.mjs
//      → oferta/capas_modulos/VENDAMAIS_IA_Modulo_1..5_*.png
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { CHROME, CHROME_ARGS } from '../chrome.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const W = 600, H = 900;
const uri = (rel) => {
  const f = path.join(ROOT, rel);
  const tipo = rel.endsWith('.png') ? 'png' : 'jpeg';
  return `data:image/${tipo};base64,` + fs.readFileSync(f).toString('base64');
};
const capa = (n) => uri(`pagina/img/capa-0${n}.jpg`);

const LOGO = `<svg viewBox="0 0 64 64"><rect x="6" y="40" width="9" height="18" rx="2" fill="#D9BFA2"/><rect x="20" y="31" width="9" height="27" rx="2" fill="#D9BFA2"/><rect x="34" y="22" width="9" height="36" rx="2" fill="#D9BFA2"/><rect x="48" y="12" width="9" height="46" rx="2" fill="#D9BFA2"/><path d="M6 30 L24 16 L34 22 L54 5" fill="none" stroke="#E3B8BC" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const MODULOS = [
  { arq: '1_Comece_aqui', num: '1', titulo: 'Comece aqui', sub: 'Manual de início rápido · 15 minutos',
    visual: `<img class="doc" style="width:300px;left:150px;top:40px;transform:rotate(-3deg)" src="${capa(0)}">` },
  { arq: '2_Modulos_em_PDF', num: '2', titulo: 'Módulos em PDF', sub: '8 módulos · + de 220 comandos prontos',
    visual: [1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => {
      const x = 40 + (i % 4) * 128, y = 20 + Math.floor(i / 4) * 175, r = [-4, 2, -2, 4][i % 4];
      return `<img class="doc" style="width:118px;left:${x}px;top:${y}px;transform:rotate(${r}deg)" src="${capa(n)}">`;
    }).join('') },
  { arq: '3_Arquivos_editaveis', num: '3', titulo: 'Arquivos editáveis', sub: '40 templates em Word · escreva direto no arquivo',
    visual: `<img class="doc" style="width:280px;left:160px;top:40px;transform:rotate(3deg)" src="${uri('build/templates-editaveis-capa.png')}">
             <div class="tag" style="left:110px;top:300px">.docx editável</div>` },
  { arq: '4_Bonus', num: '4', titulo: 'Bônus', sub: 'Planilha de Gestão + Kit de Aplicação',
    visual: `<img class="doc" style="width:440px;left:80px;top:20px;border-radius:8px" src="${uri('pagina/img/planilha-painel.jpg')}">
             <img class="doc" style="width:170px;left:360px;top:120px;transform:rotate(5deg)" src="${uri('build/kit-aplicacao-capa.png')}">
             <div class="tag" style="left:80px;top:300px">dados ilustrativos</div>` },
  { arq: '5_Tudo_em_um_arquivo', num: '5', titulo: 'Tudo em um arquivo', sub: 'Kit completo · 163 páginas em um PDF',
    visual: [8, 6, 4, 2, 0].map((n, i) =>
      `<img class="doc" style="width:220px;left:${130 + i * 22}px;top:${10 + i * 22}px;transform:rotate(${-6 + i * 3}deg)" src="${capa(n)}">`).join('') },
];

const html = (m) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;position:relative;color:#fff;font-family:Montserrat,sans-serif;
  background:radial-gradient(520px 480px at 85% 8%,#2A4560 0%,#17283B 52%,#0F1C2B 100%)}
.brand{position:absolute;left:44px;top:42px;display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;letter-spacing:.07em}
.brand span{color:#D9BFA2}.brand svg{width:30px;height:30px}
.num{position:absolute;left:44px;top:96px;font-family:'Playfair Display',serif;font-size:120px;line-height:1;color:#D9BFA2;opacity:.95}
h1{position:absolute;left:44px;top:236px;width:512px;font-family:'Playfair Display',serif;font-size:50px;line-height:1.08}
.sub{position:absolute;left:44px;top:304px;width:512px;font-size:19px;font-weight:600;color:#C9D3DD}
.vis{position:absolute;left:0;top:380px;width:${W}px;height:440px}
.doc{position:absolute;border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.5)}
.tag{position:absolute;background:#C2185B;border-radius:999px;padding:7px 14px;font-size:14px;font-weight:700}
.onda{position:absolute;left:0;bottom:0;width:${W}px;height:70px}
</style></head><body>
<div class="brand">${LOGO}VENDAMAIS <span>IA</span></div>
<div class="num">${m.num}</div>
<h1>${m.titulo}</h1>
<div class="sub">${m.sub}</div>
<div class="vis">${m.visual}</div>
<svg class="onda" viewBox="0 0 600 70" preserveAspectRatio="none"><path d="M0 40 C150 10 300 70 600 25 L600 70 L0 70 Z" fill="#EBCFD1" opacity=".9"/><path d="M0 55 C200 30 380 80 600 45 L600 70 L0 70 Z" fill="#F7F3ED"/></svg>
</body></html>`;

const OUT = path.join(ROOT, 'oferta', 'capas_modulos');
fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: CHROME_ARGS });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
for (const m of MODULOS) {
  await page.setContent(html(m), { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(OUT, `VENDAMAIS_IA_Modulo_${m.arq}.png`);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
  console.log('ok', path.relative(ROOT, out));
}
await browser.close();
