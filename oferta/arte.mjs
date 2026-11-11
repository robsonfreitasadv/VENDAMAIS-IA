// Gera a arte de venda a partir dos arquivos reais do kit.
// Uso: node oferta/arte.mjs   → oferta/VENDAMAIS_IA_Arte_*.png
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const DIR = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const A = (f) => 'file:///' + path.join(DIR, 'assets', f).replace(/\\/g, '/');
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap" rel="stylesheet">';

const LOGO = `<svg viewBox="0 0 64 64"><rect x="6" y="40" width="9" height="18" rx="2" fill="#D9BFA2"/><rect x="20" y="31" width="9" height="27" rx="2" fill="#D9BFA2"/><rect x="34" y="22" width="9" height="36" rx="2" fill="#D9BFA2"/><rect x="48" y="12" width="9" height="46" rx="2" fill="#D9BFA2"/><path d="M6 30 L24 16 L34 22 L54 5" fill="none" stroke="#EBCFD1" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M46 5 L55 4 L54 13" fill="none" stroke="#EBCFD1" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ícones de traço simples (originais)
const I = {
  post: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".8" fill="currentColor"/>',
  chat: '<path d="M4 18.5V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8z"/><path d="M8.5 9h7M8.5 12h4.5"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><path d="M9 14.5l2 2 4-4"/>',
  back: '<path d="M8 8H4V4"/><path d="M4.6 8A8 8 0 1 1 4 12"/><path d="M12 8.5V12l2.5 2"/>',
  money: '<path d="M4 19h16"/><rect x="5" y="11" width="3" height="6" rx=".8"/><rect x="10.5" y="8" width="3" height="9" rx=".8"/><rect x="16" y="5" width="3" height="12" rx=".8"/>',
  down: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19.5h14"/>',
  device: '<rect x="3" y="5" width="13" height="10" rx="1.5"/><path d="M2 18h15"/><rect x="17.5" y="8" width="4.5" height="11" rx="1.2"/>',
  shield: '<path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  arrow: '<path d="M5 12h13M13 7l5 5-5 5"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
};
const icon = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;

const BENEFITS = [
  ['post', 'Saiba o que<br>postar'],
  ['chat', 'Responda melhor<br>no WhatsApp'],
  ['cal', 'Preencha os<br>dias fracos'],
  ['back', 'Traga de volta<br>quem sumiu'],
  ['money', 'Organize<br>as finanças'],
];
const RECEBE = [
  ['8 módulos + manual', '163 páginas em PDF'],
  ['+ de 220 comandos', 'prontos para ChatGPT e Gemini'],
  ['30 campanhas', 'e 40 templates editáveis'],
  ['Plano de 30 dias', '15 a 30 minutos por dia'],
];
const BONUS = [
  ['Planilha de Gestão', 'painel automático, gráfico mensal e simulador de preço (Excel)'],
  ['Kit de Aplicação', '20 modelos de mensagens para Instagram e WhatsApp (Word)'],
];
const BAR = [['down', 'Download imediato<br>após o pagamento'], ['device', 'PDFs para ler no celular,<br>tablet ou computador'], ['shield', '7 dias de garantia<br>incondicional']];
const DISC = 'Material educativo, sem promessa de vendas ou faturamento. Dados da planilha meramente ilustrativos. ChatGPT e Gemini são marcas de seus titulares, sem vínculo com o VENDAMAIS IA.';

const covers = ['01', '02', '03', '04', '05', '06', '07', '08'];

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--navy:#17283B;--navy2:#0F1C2B;--champ:#D9BFA2;--rosa:#EBCFD1;--pink:#C2185B;--off:#F7F3ED}
body{font-family:Montserrat,sans-serif;color:#fff;-webkit-font-smoothing:antialiased}
.art{position:relative;overflow:hidden;background:radial-gradient(1200px 700px at 78% 18%,#2A4560 0%,var(--navy) 45%,var(--navy2) 100%)}
.art::after{content:"";position:absolute;inset:0;background:radial-gradient(600px 400px at 10% 100%,rgba(217,191,162,.12),transparent 70%);pointer-events:none}
.brand{display:flex;align-items:center;gap:16px}
.brand svg{width:64px;height:64px}
.brand .nm{font-weight:800;letter-spacing:.02em;line-height:1}
.brand .nm span{color:var(--champ)}
.sig{font-family:'Playfair Display',serif;font-style:italic;color:#DCE3EA}
h1{font-family:'Playfair Display',serif;font-weight:700;line-height:1.08;letter-spacing:-.01em}
h1 em{font-style:normal;color:var(--champ)}
.ic{width:100%;height:100%}
.ben{display:flex}
.ben .b{display:flex;flex-direction:column;align-items:center;text-align:center;font-weight:600;line-height:1.25}
.ben .ring{border:2px solid var(--champ);border-radius:50%;color:var(--champ);display:grid;place-items:center}
.cov{position:absolute;border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.08)}
.manual{position:absolute;border-radius:6px;box-shadow:0 24px 50px rgba(0,0,0,.5),0 0 0 2px var(--champ)}
.laptop{position:absolute}
.laptop .scr{background:#0B1622;border-radius:14px 14px 4px 4px;padding:10px;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.laptop .scr img{display:block;width:100%;border-radius:4px;background:#fff}
.laptop .base{height:14px;background:linear-gradient(#C9CED6,#8E96A3);border-radius:0 0 14px 14px;margin:0 -34px}
.laptop .tag{position:absolute;right:12px;bottom:26px;background:rgba(23,40,59,.88);color:var(--rosa);font-size:11px;font-weight:600;padding:4px 10px;border-radius:99px}
.box{background:linear-gradient(180deg,#FBF7F2,#F3EADF);color:var(--navy);border-radius:28px;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.box h3{font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--navy)}
.box .it{display:flex;gap:12px;align-items:flex-start}
.box .dot{flex:none;width:10px;height:10px;border-radius:50%;background:var(--pink);margin-top:7px}
.box b{font-weight:800}
.box small{display:block;color:#5B6670;font-weight:500}
.box .bon{border-top:1.5px solid #E1D3C2}
.box .bon h4{color:var(--pink);font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.bar{position:absolute;left:0;right:0;bottom:0;background:rgba(10,20,32,.92);border-top:1px solid rgba(217,191,162,.25);display:flex;align-items:center}
.bar .g{display:flex;align-items:center;gap:14px;font-weight:600;line-height:1.25}
.bar .g .ring{color:var(--champ)}
.bar .sep{width:1px;background:rgba(217,191,162,.35);align-self:stretch}
.cta{margin-left:auto;display:flex;align-items:center;gap:16px;background:linear-gradient(90deg,#D81B60,#C2185B);border-radius:99px;box-shadow:0 10px 30px rgba(194,24,91,.45)}
.cta .ar{background:#fff;color:var(--pink);border-radius:50%;display:grid;place-items:center}
.cta b{display:block;font-weight:800}
.cta span{display:block;opacity:.92;font-weight:500}
.disc{position:absolute;color:rgba(220,227,234,.6)}
`;

function coversFan(x, y, w, gap, rot0 = -10, rotStep = 2.6, rise = 0) {
  return covers.map((n, i) => {
    const r = rot0 + i * rotStep;
    const dy = Math.abs(i - (covers.length - 1) / 2) * rise;
    return `<img class="cov" src="${A(`capa_${n}.png`)}" style="left:${x + i * gap}px;top:${y + dy}px;width:${w}px;transform:rotate(${r}deg);z-index:${i + 1}">`;
  }).join('');
}

function horizontal() {
  return `<div class="art" style="width:1536px;height:1024px">
  <div style="position:absolute;left:64px;top:56px">
    <div class="brand">${LOGO}<div class="nm" style="font-size:40px">VENDAMAIS <span>IA</span></div></div>
    <div class="sig" style="font-size:21px;margin:12px 0 0 2px">Seu pequeno negócio, com inteligência de gente grande.</div>
  </div>
  <div style="position:absolute;left:64px;top:200px;width:820px">
    <h1 style="font-size:46px">Você cuida da beleza das suas clientes.<br><em>O VENDAMAIS IA ajuda você a cuidar do marketing e das vendas.</em></h1>
    <p style="font-size:19px;color:#DCE3EA;margin-top:18px;line-height:1.45;max-width:760px">Kit prático para negócios de beleza: comandos prontos para ChatGPT e Gemini, planilha de gestão e um plano de 30 dias — sem contratar agência.</p>
  </div>
  <div class="ben" style="position:absolute;left:52px;top:528px;gap:6px">
    ${BENEFITS.map(([k, t]) => `<div class="b" style="width:150px;font-size:14.5px;gap:10px"><div class="ring" style="width:66px;height:66px;padding:15px">${icon(k)}</div>${t}</div>`).join('')}
  </div>
  ${coversFan(70, 676, 116, 78, -9, 2.4, 5)}
  <img class="manual" src="${A('capa_00.png')}" style="left:742px;top:658px;width:128px;transform:rotate(7deg);z-index:20">
  <div class="laptop" style="left:900px;top:200px;width:560px;z-index:5">
    <div class="scr"><img src="${A('painel_total.png')}"></div><div class="base"></div>
    <div class="tag">Planilha de Gestão · dados ilustrativos</div>
  </div>
  <div class="box" style="position:absolute;left:930px;top:520px;width:540px;padding:26px 30px;z-index:6">
    <h3 style="font-size:16px;margin-bottom:14px">O que você recebe</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 18px">
      ${RECEBE.map(([b, s]) => `<div class="it"><div class="dot"></div><div style="font-size:16px"><b>${b}</b><small style="font-size:12.5px">${s}</small></div></div>`).join('')}
    </div>
    <div class="bon" style="margin-top:16px;padding-top:14px">
      <h4 style="font-size:13px;margin-bottom:10px">Bônus</h4>
      ${BONUS.map(([b, s]) => `<div class="it" style="margin-bottom:8px"><div class="dot" style="background:var(--champ)"></div><div style="font-size:15px"><b>${b}</b> <span style="color:#5B6670;font-size:13px">— ${s}</span></div></div>`).join('')}
    </div>
  </div>
  <div class="bar" style="height:112px;padding:0 32px 0 44px;gap:20px">
    ${BAR.map(([k, t], i) => `${i ? '<div class="sep" style="margin:26px 0"></div>' : ''}<div class="g" style="font-size:14px;gap:10px"><div class="ring" style="width:34px;height:34px">${icon(k)}</div><div>${t}</div></div>`).join('')}
    <div class="cta" style="padding:12px 28px 12px 14px">
      <div class="ar" style="width:50px;height:50px;padding:12px">${icon('arrow')}</div>
      <div><b style="font-size:24px">Comece agora</b><span style="font-size:13px">e organize o marketing do seu negócio</span></div>
    </div>
  </div>
  <div class="disc" style="left:64px;bottom:118px;font-size:10.5px;width:820px">${DISC}</div>
</div>`;
}

function feed() {
  return `<div class="art" style="width:1080px;height:1350px">
  <div style="position:absolute;left:0;right:0;top:56px;display:flex;flex-direction:column;align-items:center">
    <div class="brand">${LOGO}<div class="nm" style="font-size:42px">VENDAMAIS <span>IA</span></div></div>
    <div class="sig" style="font-size:21px;margin-top:12px">Seu pequeno negócio, com inteligência de gente grande.</div>
  </div>
  <div style="position:absolute;left:70px;right:70px;top:210px;text-align:center">
    <h1 style="font-size:50px">Você cuida da beleza das suas clientes.<br><em>O VENDAMAIS IA ajuda você a cuidar do marketing e das vendas.</em></h1>
  </div>
  <div class="ben" style="position:absolute;left:40px;right:40px;top:462px;justify-content:space-between">
    ${BENEFITS.map(([k, t]) => `<div class="b" style="width:190px;font-size:17px;gap:12px"><div class="ring" style="width:78px;height:78px;padding:18px">${icon(k)}</div>${t}</div>`).join('')}
  </div>
  ${coversFan(80, 655, 148, 92, -8, 2.2, 6)}
  <img class="manual" src="${A('capa_00.png')}" style="left:830px;top:632px;width:160px;transform:rotate(7deg);z-index:20">
  <div class="box" style="position:absolute;left:60px;right:60px;top:910px;padding:28px 34px;z-index:30">
    <h3 style="font-size:17px;margin-bottom:14px">O que você recebe</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 22px">
      ${RECEBE.map(([b, s]) => `<div class="it"><div class="dot"></div><div style="font-size:18px"><b>${b}</b><small style="font-size:14px">${s}</small></div></div>`).join('')}
    </div>
    <div class="bon" style="margin-top:16px;padding-top:14px">
      ${BONUS.map(([b, s]) => `<div class="it" style="margin-bottom:6px"><div class="dot" style="background:var(--champ)"></div><div style="font-size:16px"><b style="color:var(--pink)">Bônus:</b> <b>${b}</b> <span style="color:#5B6670;font-size:14px">— ${s}</span></div></div>`).join('')}
    </div>
  </div>
  <div class="bar" style="height:118px;padding:0 34px;gap:16px;justify-content:space-between">
    ${BAR.map(([k, t], i) => `${i ? '<div class="sep" style="margin:30px 0"></div>' : ''}<div class="g" style="font-size:13px;gap:9px"><div class="ring" style="width:30px;height:30px">${icon(k)}</div><div>${t}</div></div>`).join('')}
  </div>
  <div class="disc" style="left:60px;right:60px;bottom:126px;font-size:11px;text-align:center">${DISC}</div>
</div>`;
}

const page = (body) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${FONTS}<style>${CSS}</style></head><body>${body}</body></html>`;

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] });
const pg = await browser.newPage();
for (const [name, html, w, h] of [['Horizontal_1536x1024', horizontal(), 1536, 1024], ['Feed_1080x1350', feed(), 1080, 1350]]) {
  const file = path.join(DIR, 'assets', `arte_${name}.html`);
  fs.writeFileSync(file, page(html));
  await pg.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await pg.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(DIR, `VENDAMAIS_IA_Arte_${name}.png`), clip: { x: 0, y: 0, width: w, height: h } });
  console.log('ok', name);
}
await browser.close();
