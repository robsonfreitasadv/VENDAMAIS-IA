// Imagem do produto para a Kiwify (300x250 px) com capas reais do kit.
// Uso: node oferta/imagem_produto.mjs  →  oferta/VENDAMAIS_IA_Produto_300x250.png
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { CHROME, CHROME_ARGS } from '../chrome.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const img = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'pagina/img', f)).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:300px;height:250px;overflow:hidden;font-family:Montserrat,sans-serif;color:#fff;
  background:radial-gradient(260px 220px at 85% 10%,#2A4560 0%,#17283B 55%,#0F1C2B 100%);position:relative}
.brand{position:absolute;left:16px;top:16px;display:flex;align-items:center;gap:7px;font-weight:800;font-size:13px;letter-spacing:.06em}
.brand span{color:#D9BFA2}.brand svg{width:20px;height:20px}
h1{position:absolute;left:16px;top:48px;width:132px;font-family:'Playfair Display',serif;font-size:17px;line-height:1.18}
h1 em{font-style:normal;color:#D9BFA2}
ul{position:absolute;left:16px;top:146px;list-style:none;padding:0;font-size:10.5px;font-weight:600;line-height:1.75;color:#E8EDF2}
li::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#D81B60;margin-right:7px;vertical-align:1px}
.capa{position:absolute;width:60px;border-radius:4px;box-shadow:0 8px 18px rgba(0,0,0,.45)}
.c1{left:180px;top:64px;transform:rotate(-9deg)}
.c2{left:226px;top:66px;transform:rotate(8deg)}
.c3{left:200px;top:52px;transform:rotate(-1deg);width:64px;z-index:2}
.selo{position:absolute;right:12px;bottom:12px;background:#C2185B;border-radius:999px;padding:5px 10px;font-size:9.5px;font-weight:700;letter-spacing:.02em}
</style></head><body>
<div class="brand"><svg viewBox="0 0 64 64"><rect x="6" y="40" width="9" height="18" rx="2" fill="#D9BFA2"/><rect x="20" y="31" width="9" height="27" rx="2" fill="#D9BFA2"/><rect x="34" y="22" width="9" height="36" rx="2" fill="#D9BFA2"/><rect x="48" y="12" width="9" height="46" rx="2" fill="#D9BFA2"/><path d="M6 30 L24 16 L34 22 L54 5" fill="none" stroke="#EBCFD1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>VENDAMAIS <span>IA</span></div>
<h1>Marketing e vendas para <em>negócios de beleza</em></h1>
<ul><li>+ de 220 comandos</li><li>Planilha de gestão</li><li>Plano de 30 dias</li></ul>
<img class="capa c1" src="${img('capa-01.jpg')}"><img class="capa c2" src="${img('capa-02.jpg')}"><img class="capa c3" src="${img('capa-00.jpg')}">
<div class="selo">Download imediato</div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: CHROME_ARGS });
const page = await browser.newPage();
await page.setViewport({ width: 300, height: 250, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
const out = path.join(ROOT, 'oferta', 'VENDAMAIS_IA_Produto_300x250.png');
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 300, height: 250 } });
await browser.close();
console.log('ok', path.relative(ROOT, out));
