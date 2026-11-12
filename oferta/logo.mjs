// Logotipo horizontal 600x120 (área de membros da Kiwify).
// Uso: node oferta/logo.mjs  →  oferta/VENDAMAIS_IA_Logo_600x120_fundo_escuro.png
//                               oferta/VENDAMAIS_IA_Logo_600x120_transparente.png (para fundo claro)
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { CHROME, CHROME_ARGS } from '../chrome.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = (fundo, texto, destaque, sub) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&family=Playfair+Display:ital,wght@1,500&display=swap" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
html,body{width:600px;height:120px;overflow:hidden;background:${fundo}}
.l{height:120px;display:flex;align-items:center;justify-content:center;gap:18px}
svg{width:68px;height:68px;flex:none}
.n{font-family:Montserrat,sans-serif;font-weight:800;font-size:46px;letter-spacing:.05em;color:${texto};line-height:1}
.n span{color:${destaque}}
.s{font-family:'Playfair Display',serif;font-style:italic;font-size:15px;color:${sub};margin-top:6px;letter-spacing:.01em}
</style></head><body><div class="l">
<svg viewBox="0 0 64 64"><rect x="6" y="40" width="9" height="18" rx="2" fill="#D9BFA2"/><rect x="20" y="31" width="9" height="27" rx="2" fill="#D9BFA2"/><rect x="34" y="22" width="9" height="36" rx="2" fill="#D9BFA2"/><rect x="48" y="12" width="9" height="46" rx="2" fill="#D9BFA2"/><path d="M6 30 L24 16 L34 22 L54 5" fill="none" stroke="#E3B8BC" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M46 5 L55 4 L54 13" fill="none" stroke="#E3B8BC" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
<div><div class="n">VENDAMAIS <span>IA</span></div><div class="s">Seu pequeno negócio, com inteligência de gente grande.</div></div>
</div></body></html>`;

const versoes = [
  ['fundo_escuro', html('#17283B', '#FFFFFF', '#D9BFA2', '#C9D3DD'), false],
  ['transparente', html('transparent', '#17283B', '#8A6B47', '#5B6670'), true],
];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: CHROME_ARGS });
const page = await browser.newPage();
await page.setViewport({ width: 600, height: 120, deviceScaleFactor: 1 });
for (const [nome, h, transp] of versoes) {
  await page.setContent(h, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(ROOT, 'oferta', `VENDAMAIS_IA_Logo_600x120_${nome}.png`);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 600, height: 120 }, omitBackground: transp });
  console.log('ok', path.relative(ROOT, out));
}
await browser.close();
