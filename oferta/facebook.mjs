// Imagens da Página do Facebook: foto do perfil (1080x1080, lida em círculo) e capa (1640x624).
// Na capa, o conteúdo importante fica no centro (≈1100 px), porque o celular corta as laterais.
// Uso: node oferta/facebook.mjs  →  oferta/facebook/VENDAMAIS_IA_Facebook_*.png
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { CHROME, CHROME_ARGS } from '../chrome.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const capa = (n) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, `pagina/img/capa-0${n}.jpg`)).toString('base64');
const FONTES = '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Playfair+Display:ital,wght@0,700;1,500&display=swap" rel="stylesheet">';
const LOGO = (w) => `<svg viewBox="0 0 64 64" style="width:${w}px;height:${w}px"><rect x="6" y="40" width="9" height="18" rx="2" fill="#D9BFA2"/><rect x="20" y="31" width="9" height="27" rx="2" fill="#D9BFA2"/><rect x="34" y="22" width="9" height="36" rx="2" fill="#D9BFA2"/><rect x="48" y="12" width="9" height="46" rx="2" fill="#D9BFA2"/><path d="M6 30 L24 16 L34 22 L54 5" fill="none" stroke="#E3B8BC" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M46 5 L55 4 L54 13" fill="none" stroke="#E3B8BC" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const FUNDO = 'radial-gradient(900px 700px at 80% 0%,#2A4560 0%,#17283B 52%,#0F1C2B 100%)';

const perfil = `<!doctype html><html><head><meta charset="utf-8">${FONTES}<style>
*{margin:0;box-sizing:border-box}body{width:1080px;height:1080px;background:${FUNDO};display:flex;align-items:center;justify-content:center;font-family:Montserrat,sans-serif;color:#fff}
.c{display:flex;flex-direction:column;align-items:center;gap:26px;margin-top:-10px}
.n{font-weight:800;font-size:96px;letter-spacing:.05em;line-height:1}.n span{color:#D9BFA2}
.s{font-family:'Playfair Display',serif;font-style:italic;font-size:44px;color:#EBCFD1}
</style></head><body><div class="c">${LOGO(300)}<div class="n">VENDAMAIS <span>IA</span></div><div class="s">marketing para beleza</div></div></body></html>`;

const leque = [1, 2, 0, 6, 4].map((n, i) => {
  const r = [-12, -6, 0, 6, 12][i], x = 1060 + i * 70, y = 120 + Math.abs(i - 2) * 18, z = 10 - Math.abs(i - 2);
  return `<img src="${capa(n)}" style="position:absolute;left:${x}px;top:${y}px;width:200px;border-radius:8px;transform:rotate(${r}deg);z-index:${z};box-shadow:0 20px 40px rgba(0,0,0,.5)">`;
}).join('');

const banner = `<!doctype html><html><head><meta charset="utf-8">${FONTES}<style>
*{margin:0;box-sizing:border-box}body{width:1640px;height:624px;overflow:hidden;position:relative;background:${FUNDO};font-family:Montserrat,sans-serif;color:#fff}
.t{position:absolute;left:290px;top:120px;width:760px}
.e{font-size:22px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#D9BFA2;margin-bottom:16px}
h1{font-family:'Playfair Display',serif;font-size:62px;line-height:1.08}h1 em{font-style:normal;color:#D9BFA2}
.l{margin-top:26px;display:flex;gap:12px;flex-wrap:wrap}
.l span{border:1.5px solid rgba(217,191,162,.6);border-radius:999px;padding:9px 18px;font-size:21px;font-weight:600;color:#F2EBE3}
.onda{position:absolute;left:0;bottom:0;width:1640px;height:70px}
</style></head><body>
<div class="t"><div class="e">Para salões, barbearias e estética</div>
<h1>Marketing e vendas com IA para <em>negócios de beleza</em></h1>
<div class="l"><span>+ de 220 comandos</span><span>Planilha de gestão</span><span>Plano de 30 dias</span></div></div>
${leque}
<svg class="onda" viewBox="0 0 1640 70" preserveAspectRatio="none"><path d="M0 40 C400 8 900 70 1640 22 L1640 70 L0 70 Z" fill="#EBCFD1" opacity=".85"/><path d="M0 56 C500 30 1100 82 1640 46 L1640 70 L0 70 Z" fill="#F7F3ED"/></svg>
</body></html>`;

const OUT = path.join(ROOT, 'oferta', 'facebook');
fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: CHROME_ARGS });
const page = await browser.newPage();
for (const [nome, h, w, hh] of [['Perfil_1080x1080', perfil, 1080, 1080], ['Capa_1640x624', banner, 1640, 624]]) {
  await page.setViewport({ width: w, height: hh, deviceScaleFactor: 1 });
  await page.setContent(h, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(OUT, `VENDAMAIS_IA_Facebook_${nome}.png`);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: hh } });
  console.log('ok', path.relative(ROOT, out));
}
await browser.close();
