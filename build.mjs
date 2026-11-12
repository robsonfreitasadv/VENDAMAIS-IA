// Gera os PDFs do VENDAMAIS IA: capa + miolo por módulo.
// Uso: node build.mjs [id ...]   (sem argumentos = todos)
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';
import { CHROME, CHROME_ARGS } from './chrome.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const mods = JSON.parse(fs.readFileSync(path.join(ROOT, 'modulos.json'), 'utf8'));
const css = fs.readFileSync(path.join(ROOT, 'estilo.css'), 'utf8');
const only = process.argv.slice(2);

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap" rel="stylesheet">';

const LOGO = (c = '#D9BFA2') => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="6" y="40" width="9" height="18" rx="2" fill="${c}"/>
  <rect x="20" y="31" width="9" height="27" rx="2" fill="${c}"/>
  <rect x="34" y="22" width="9" height="36" rx="2" fill="${c}"/>
  <rect x="48" y="12" width="9" height="46" rx="2" fill="${c}"/>
  <path d="M6 30 L24 16 L34 22 L54 5" fill="none" stroke="#EBCFD1" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M46 5 L55 4 L54 13" fill="none" stroke="#EBCFD1" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
const BRAND = `<div class="brand">${LOGO()}<div class="name">VENDAMAIS <span>IA</span></div></div>`;
const SIGN = 'Seu pequeno negócio, com inteligência de gente grande.';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ph = (s) => s.replace(/\[([^\]\n]+)\]/g, '<span class="ph">[$1]</span>');
const split = (t) => {
  const i = t.indexOf(' — ');
  return i < 0 ? [null, t] : [t.slice(0, i), t.slice(i + 3)];
};

function render(md) {
  const toc = [];
  let firstSection = true;
  const renderer = new marked.Renderer();
  renderer.code = (code, lang) => {
    if (lang !== 'prompt' && lang !== 'modelo') return `<pre>${esc(code)}</pre>`;
    const label = lang === 'prompt' ? 'Copie e cole no ChatGPT ou Gemini' : 'Modelo para copiar e adaptar';
    const lines = code.split('\n').filter((l) => l.trim() !== '').map((l) => {
      const li = /^(\s*)(- |\d+\. )/.test(l);
      return `<div${li ? ' class="li"' : ''}>${ph(esc(l))}</div>`;
    });
    return `<div class="prompt ${lang}"><div class="lbl">${label}</div><div class="body">${lines.join('')}</div></div>`;
  };
  renderer.heading = (text, level, raw) => {
    if (level === 2) {
      const [eyebrow, title] = split(raw);
      toc.push({ eyebrow, title, items: [] });
      const cls = firstSection ? 'section first' : 'section';
      firstSection = false;
      return `<div class="${cls}">${eyebrow ? `<small>${esc(eyebrow)}</small>` : ''}<h2>${esc(title)}</h2></div>`;
    }
    if (level === 3) {
      const [tag, title] = split(raw);
      if (toc.length) toc[toc.length - 1].items.push({ tag, title });
      return `<h3 class="cmd">${tag ? `<span class="tag">${esc(tag)}</span>` : ''}<span>${esc(title)}</span></h3>`;
    }
    return `<h${level}>${text}</h${level}>`;
  };
  let html = marked.parse(md, { renderer, gfm: true });
  // agrupa título + objetivo + quadro em blocos que não se partem;
  // a faixa de seção e sua introdução curta seguem junto com o primeiro bloco
  const parts = html.split(/(?=<div class="section|<h3 class="cmd">|<h4>)/);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    let chunk = parts[i];
    const isSection = chunk.startsWith('<div class="section');
    const shortIntro = isSection && (chunk.match(/<p>/g) || []).length <= 1 && !/<(table|ul|ol|blockquote)/.test(chunk);
    if (shortIntro && parts[i + 1] && /^<h[34]/.test(parts[i + 1])) { chunk += parts[++i]; }
    const len = chunk.replace(/<[^>]+>/g, '').length;
    const cls = len < 1100 ? 'item' : 'item long';
    out.push(/^<(div class="section|h3|h4)/.test(chunk) ? `<div class="${cls}">${chunk}</div>` : chunk);
  }
  html = out.join('');
  // campos entre colchetes nas tabelas
  html = html.replace(/<td>([\s\S]*?)<\/td>/g, (_, c) => `<td>${ph(c)}</td>`);
  // listas de verificação
  html = html.replace(/<ul>\s*(<li><input[^>]*type="checkbox"[^>]*>)/g, '<ul class="check">$1')
             .replace(/<input[^>]*type="checkbox"[^>]*>\s*/g, '');
  return { html, toc };
}

function tocHtml(toc, m) {
  const groups = toc.filter((g) => g.items.length).map((g) => {
    const items = g.items.map((it) => {
      const n = it.tag ? (it.tag.match(/\d+/) || [''])[0] : '';
      return `<li>${n ? `<b>${n}</b>` : ''}${esc(it.title)}</li>`;
    }).join('');
    return `<div class="grp"><div class="grp-h">${g.eyebrow ? `<small>${esc(g.eyebrow)}</small>` : ''}${esc(g.title)}</div><ul>${items}</ul></div>`;
  }).join('');
  if (!groups) return '';
  return `<div class="toc page-break"><h2 class="toc-title">Neste módulo</h2><div class="toc-sub">${esc(m.subtitle)} · ${esc(m.count)}</div>${groups}</div>`;
}

function coverHtml(m) {
  const kicker = m.kicker || 'Módulo';
  const num = m.num === '00' ? '' : `<div class="num">${m.num}</div>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${FONTS}<style>${css} @page{size:A4;margin:0}</style></head><body>
<div class="cover">
  ${BRAND}
  <div class="kicker">${esc(kicker)}</div>
  ${num}
  <h1>${esc(m.title)}</h1>
  <div class="sub">${esc(m.subtitle)}</div>
  <div class="pill">${esc(m.count)}</div>
  <svg class="wave" viewBox="0 0 210 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 30 C 50 10, 110 55, 210 22 L210 70 L0 70 Z" fill="#EBCFD1"/>
    <path d="M0 44 C 60 24, 120 66, 210 38 L210 70 L0 70 Z" fill="#F7F3ED"/>
  </svg>
  <div class="sign">${SIGN}</div>
</div></body></html>`;
}

function bodyHtml(m, md) {
  const { html, toc } = render(md);
  const closing = `<div class="closing">${BRAND}<div class="sig">${SIGN}</div><div class="disc">${esc(m.disclaimer)}</div></div>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${FONTS}<style>${css}</style></head><body>
${tocHtml(toc, m)}
${html}
${closing}
</body></html>`;
}

const footer = (m) => `<div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#8A6B47;padding:0 17mm;display:flex;justify-content:space-between;">
<span><b style="color:#17283B">VENDAMAIS IA</b> &nbsp;·&nbsp; ${m.num === '00' ? '' : 'Módulo ' + m.num + ' — '}${esc(m.title)}</span><span class="pageNumber"></span></div>`;

fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: CHROME_ARGS });
const page = await browser.newPage();
for (const m of mods) {
  if (only.length && !only.includes(m.id)) continue;
  if (m.formato === 'word') {
    // só a capa, como imagem, para o documento Word (gerar_word.py)
    const cHtml = path.join(ROOT, 'build', m.id + '-capa.html');
    fs.writeFileSync(cHtml, coverHtml(m));
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.goto('file:///' + cHtml.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(ROOT, 'build', m.id + '-capa.png'), clip: { x: 0, y: 0, width: 794, height: 1123 } });
    console.log('ok capa word', m.id);
    continue;
  }
  const src = path.join(ROOT, 'conteudo', m.id + '.md');
  if (!fs.existsSync(src)) { console.log('pulando (sem conteúdo):', m.id); continue; }
  const md = fs.readFileSync(src, 'utf8');
  const out = path.join(ROOT, 'build');
  const cHtml = path.join(out, m.id + '-capa.html');
  const bHtml = path.join(out, m.id + '-miolo.html');
  fs.writeFileSync(cHtml, coverHtml(m));
  fs.writeFileSync(bHtml, bodyHtml(m, md));

  await page.goto('file:///' + cHtml.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(out, m.id + '-capa.pdf'), format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

  await page.goto('file:///' + bHtml.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: path.join(out, m.id + '-miolo.pdf'), format: 'A4', printBackground: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer(m),
    margin: { top: '18mm', right: '17mm', bottom: '20mm', left: '17mm' },
  });
  console.log('ok', m.id);
}
await browser.close();
