// Gera as peças visuais da semana de Instagram de 23 a 29/11/2026 (plano: marketing/semana-2026-11-23.md).
// Uso: node marketing/pecas_semana.mjs [seg qua qui sab ter]  → marketing/semana-2026-11-23/*.png
// Mesmo padrão visual de anuncios/criativos.mjs (cores, fontes, logo, rodapé de marca).
// Regras: só material real do kit; sem promessa de resultado; sem preço riscado nem escassez; nada sobre suporte ou e-mail;
// dados da planilha e números do exemplo rotulados como ilustrativos.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { CHROME, CHROME_ARGS } from '../chrome.mjs';

const DIR = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const ROOT = path.resolve(decodeURIComponent(DIR), '..');
const IMG = (f) => 'file:///' + path.join(ROOT, 'anuncios', 'img', f).replace(/\\/g, '/');
const OUT = path.join(ROOT, 'marketing', 'semana-2026-11-23');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">';
const LOGO = `<svg viewBox="0 0 64 64"><rect x="6" y="40" width="9" height="18" rx="2" fill="#D9BFA2"/><rect x="20" y="31" width="9" height="27" rx="2" fill="#D9BFA2"/><rect x="34" y="22" width="9" height="36" rx="2" fill="#D9BFA2"/><rect x="48" y="12" width="9" height="46" rx="2" fill="#D9BFA2"/><path d="M6 30 L24 16 L34 22 L54 5" fill="none" stroke="#EBCFD1" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M46 5 L55 4 L54 13" fill="none" stroke="#EBCFD1" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const BRAND = (s = 28) => `<div class="brand" style="font-size:${s}px">${LOGO}<span>VENDAMAIS <b>IA</b></span></div>`;
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 7l5 5-5 5"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const SAVE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';
const SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>';
const CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z"/></svg>';

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--navy:#17283B;--navy2:#0F1C2B;--champ:#D9BFA2;--champ-ink:#8A6B47;--rosa:#EBCFD1;--rosa2:#F6E6E7;--off:#F7F3ED;--pink:#C2185B;--pink2:#D81B60;--ok:#2E7D5B;--ink:#1F2933;--muted:#5B6670}
body{font-family:Montserrat,sans-serif;-webkit-font-smoothing:antialiased;color:#fff}
.c{position:relative;overflow:hidden;display:flex;flex-direction:column;padding:64px}
.dark{background:radial-gradient(900px 700px at 85% 0%,#2C4864 0%,var(--navy) 48%,var(--navy2) 100%)}
.light{background:var(--off);color:var(--ink)}
.brand{display:flex;align-items:center;gap:.45em;font-weight:800;letter-spacing:.02em;white-space:nowrap;flex:none}
.brand svg{width:1.6em;height:1.6em}.brand b{color:var(--champ)}
.light .brand{color:var(--navy)}.light .brand b{color:var(--champ-ink)}
.eyebrow{font-size:26px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--champ)}
.light .eyebrow{color:var(--champ-ink)}
h1{font-family:'Playfair Display',serif;font-weight:800;line-height:1.08;letter-spacing:-.015em}
h1 em{font-style:normal;color:var(--champ)}
.light h1{color:var(--navy)}.light h1 em{color:var(--pink)}
.sub{font-size:36px;line-height:1.4;color:#D6DEE6;font-weight:500}
.light .sub{color:var(--muted)}
.spacer{flex:1}
.body{flex:1;display:flex;flex-direction:column;min-height:0;padding-top:56px}
.nw{white-space:nowrap}
.foot{display:flex;align-items:center;justify-content:space-between;padding-top:28px;border-top:1.5px solid rgba(217,191,162,.28);margin-top:28px}
.light .foot{border-top-color:rgba(23,40,59,.15)}
.num{position:absolute;top:56px;right:64px;font-weight:700;font-size:26px;color:rgba(255,255,255,.5)}
.light .num{color:rgba(23,40,59,.45)}
.swipe{display:flex;align-items:center;gap:12px;font-weight:700;font-size:28px;color:var(--champ)}
.swipe svg{width:34px;height:34px}
.big-n{font-family:'Playfair Display',serif;font-weight:800;font-size:200px;line-height:.9;color:var(--champ)}
.bub{border-radius:30px;padding:30px 34px;font-size:34px;line-height:1.42;position:relative}
.bub .lb{display:flex;align-items:center;gap:10px;font-size:24px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}
.bub .lb svg{width:30px;height:30px}
.bad{background:#2A3542;color:#C4CDD6}.bad .lb{color:#F28B9B}
.good{background:#FFFFFF;color:#1E3A2F;box-shadow:0 20px 50px rgba(0,0,0,.35)}.good .lb{color:var(--ok)}
.prompt{background:var(--off);color:var(--ink);border-left:10px solid var(--champ);border-radius:0 28px 28px 0;padding:34px 38px;font-size:31px;line-height:1.5;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.prompt .lbl{font-size:24px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--champ-ink);margin-bottom:14px}
.ph{background:var(--rosa2);color:#7A3E46;font-weight:700;border-radius:6px;box-shadow:0 0 0 4px var(--rosa2)}
.good .ph{background:var(--rosa2)}
.shot{border-radius:22px;box-shadow:0 30px 70px rgba(0,0,0,.45);background:#fff;display:block}
.selo{position:absolute;background:var(--pink);color:#fff;font-weight:800;font-size:30px;letter-spacing:.06em;text-transform:uppercase;padding:14px 28px;border-radius:99px;box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 0 4px #fff}
.list{display:flex;flex-direction:column;gap:22px}
.list .it{display:flex;gap:22px;align-items:flex-start;background:rgba(255,255,255,.06);border:1.5px solid rgba(217,191,162,.3);border-radius:24px;padding:28px 30px;font-size:34px;line-height:1.38;font-weight:600}
.list .it svg{flex:none;width:44px;height:44px;color:var(--champ);margin-top:2px}
.warn{background:rgba(194,24,91,.16);border:2px solid rgba(235,207,209,.55);border-radius:24px;padding:26px 30px;font-size:32px;line-height:1.4;font-weight:700;color:#fff}
.table{border-radius:28px;overflow:hidden;background:#fff;color:var(--ink);box-shadow:0 24px 60px rgba(0,0,0,.3)}
.table .row{display:grid;grid-template-columns:220px 1fr;border-bottom:1px solid #EEE7DD}
.table .row:last-child{border-bottom:0}
.table .t{background:var(--navy);color:var(--champ);font-weight:800;font-size:40px;padding:22px 28px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #22384F}
.table .d{font-size:34px;line-height:1.3;font-weight:600;padding:22px 32px;display:flex;align-items:center}
.table .hd{background:var(--champ);color:var(--navy);font-weight:800;font-size:26px;letter-spacing:.14em;text-transform:uppercase;padding:18px 28px}
.save{display:inline-flex;align-items:center;gap:16px;background:linear-gradient(90deg,var(--pink2),var(--pink));color:#fff;font-weight:800;font-size:34px;padding:22px 38px;border-radius:99px;box-shadow:0 14px 36px rgba(194,24,91,.45);align-self:flex-start}
.save svg{width:38px;height:38px}
.mini{display:flex;flex-direction:column;gap:18px}
.mini .m{background:#fff;color:var(--ink);border-radius:24px;padding:24px 28px;font-size:28px;line-height:1.4;box-shadow:0 16px 40px rgba(0,0,0,.3)}
.mini .m b{display:block;font-size:24px;letter-spacing:.12em;text-transform:uppercase;color:var(--champ-ink);margin-bottom:6px}
.calc{background:#fff;color:var(--ink);border-radius:32px;box-shadow:0 30px 70px rgba(0,0,0,.4);overflow:hidden}
.calc .r{display:flex;justify-content:space-between;align-items:baseline;gap:24px;padding:30px 40px;border-bottom:1.5px solid #EEE7DD;font-size:38px;font-weight:600}
.calc .r b{font-family:'Playfair Display',serif;font-size:56px;font-weight:800;color:var(--navy);white-space:nowrap}
.calc .r.hl{background:var(--rosa2)}.calc .r.hl b{color:var(--pink)}
.calc .r.sm{font-size:30px;color:var(--muted);padding:20px 40px}
`;

const page = (w, h, body) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${FONTS}<style>${CSS}</style></head><body style="width:${w}px;height:${h}px">${body}</body></html>`;

// Card 4:5 com numeração discreta no topo e rodapé de marca.
const card = (inner, { n = '', cls = 'dark', right = '', h = 1350, style = '' } = {}) =>
  `<div class="c ${cls}" style="width:1080px;height:${h}px;${style}">${n ? `<div class="num">${n}</div>` : ''}
    <div class="body">${inner}</div>
    <div class="foot">${BRAND(28)}${right}</div>
  </div>`;
const ph = (t) => `<span class="ph">[${t}]</span>`;

// ------------------------------------------------------------- SEGUNDA 23/11 (9 cards)
const IDEIAS = [
  ['Combo no lugar do desconto', 'Junte dois serviços que já combinam e mostre o que a cliente leva a mais na mesma visita.'],
  ['Um cuidado a mais no mesmo horário', 'Um serviço complementar rápido, que custe pouco para você, incluído no atendimento.'],
  ['Vantagem para quem agenda antes', 'Prioridade de horário para quem marcar até sexta. Ofereça só os horários que você tem de verdade.'],
  ['Convite para clientes antigos', 'Mensagem pessoal, com um horário sugerido, para quem não vem há um tempo. Quem pedir para não receber, não recebe.'],
  ['Indicação com regra clara', 'Um benefício para quem indica e para quem chega, com prazo verdadeiro escrito na mensagem.'],
];
const SEG = [
  card(`<div class="spacer"></div>
    <div class="eyebrow">Black Friday · 6 ideias</div>
    <h1 style="font-size:96px;margin-top:22px">Black Friday no seu negócio de beleza <em>sem dar 30% de desconto</em></h1>
    <div class="sub" style="margin-top:34px;font-size:40px;color:#fff;font-weight:700">6 ideias para movimentar a agenda</div>
    <div class="spacer"></div>
    <div class="swipe" style="font-size:32px">Arraste: no fim tem um comando para copiar ${ARROW}</div>`,
  { n: '1/9' }),
  ...IDEIAS.map(([t, d], i) => card(`<div class="spacer"></div>
    <div class="big-n">${i + 1}.</div>
    <h1 style="font-size:84px;margin-top:20px">${t}</h1>
    <div class="sub" style="margin-top:36px;font-size:40px">${d}</div>
    <div class="spacer"></div>`, { n: `${i + 2}/9` })),
  card(`<div class="spacer"></div>
    <div class="big-n">6.</div>
    <h1 style="font-size:80px;margin-top:20px">Se for dar desconto, <em>faça a conta antes</em></h1>
    <div class="sub" style="margin-top:32px;font-size:38px">Preço, custo, taxa e quanto você precisa atender a mais para compensar.</div>
    <div class="warn" style="margin-top:34px">E nunca suba o preço antes para “dar desconto” depois.</div>
    <div class="spacer"></div>`, { n: '7/9' }),
  card(`<div class="spacer"></div>
    <h1 style="font-size:66px">Copie e cole no <em>ChatGPT ou no Gemini:</em></h1>
    <div class="prompt" style="margin-top:36px"><div class="lbl">Módulo 03 · Comando 18</div>Quero atrair clientes sem reduzir o preço do meu serviço. Serviço: ${ph('SERVIÇO')}. Público: ${ph('PÚBLICO')}. Diferenciais: ${ph('DIFERENCIAIS')}. Crie dez alternativas comerciais ao desconto. Considere conveniência, experiência, atendimento, benefícios adicionais autorizados, programas de relacionamento e combos. Explique o custo e o benefício potencial de cada ideia.</div>
    <div class="spacer"></div>`, { n: '8/9' }),
  card(`<div class="spacer"></div>
    <h1 style="font-size:100px">Salve para planejar a <em>sua Black Friday</em></h1>
    <div style="margin-top:44px" class="save">${SAVE} Salvar este post</div>
    <div class="sub" style="margin-top:52px;font-size:38px">Comando 18 do Módulo 03 · 1 dos mais de 220 comandos do <b class="nw" style="color:#fff">VENDAMAIS IA</b></div>
    <div class="sub" style="margin-top:26px;font-size:30px;font-style:italic;color:#B8C4D0">A IA pode errar: revise antes de usar.</div>
    <div class="spacer"></div>`, { n: '9/9' }),
];

// ------------------------------------------------------------- QUARTA 25/11 (7 cards)
const msgCard = (n, titulo, label, texto) => card(`<div class="spacer"></div>
    <div class="big-n" style="font-size:160px">${n}.</div>
    <h1 style="font-size:80px;margin:16px 0 44px">${titulo}</h1>
    <div class="bub good" style="font-size:38px"><div class="lb">${CHAT} ${label}</div>“${texto}”</div>
    <div class="spacer"></div>`, { n: `${n + 1}/7` });
const QUA = [
  card(`<div class="spacer"></div>
    <div class="eyebrow">Fim de ano chegando</div>
    <h1 style="font-size:90px;margin-top:22px">3 mensagens de WhatsApp para confirmar horários <em>sem soar como cobrança</em></h1>
    <div class="spacer"></div>`,
  { n: '1/7', right: `<div class="swipe">Arraste e copie ${ARROW}</div>` }),
  msgCard(1, 'Logo depois de marcar', 'Confirmação',
    `Olá, ${ph('PRIMEIRO NOME')}! Seu horário está confirmado para ${ph('DATA')}, às ${ph('HORA')}, para ${ph('SERVIÇO')}. Endereço: ${ph('ENDEREÇO')}. Se precisar alterar, avise pelo ${ph('CANAL')}.`),
  msgCard(2, 'Um dia antes', 'Lembrete',
    `Olá, ${ph('PRIMEIRO NOME')}! Passando para lembrar seu atendimento em ${ph('DATA')}, às ${ph('HORA')}. Está tudo certo? Se precisar de alguma orientação, estamos à disposição.`),
  card(`<div class="spacer"></div>
    <div class="big-n" style="font-size:140px">3.</div>
    <h1 style="font-size:74px;margin:12px 0 36px">Quando a cliente falta</h1>
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="bub bad"><div class="lb">${X} Afasta</div>“Você não veio. Quer remarcar?”</div>
      <div class="bub good"><div class="lb">${CHECK} Aproxima</div>“Olá! Sentimos sua falta no horário de hoje. Espero que esteja tudo bem. Se ainda tiver interesse, posso ajudar a encontrar uma nova data para seu atendimento.”</div>
    </div>
    <div class="spacer"></div>`, { n: '4/7' }),
  card(`<div class="spacer"></div>
    <div class="eyebrow">Checklist</div>
    <h1 style="font-size:96px;margin:16px 0 48px">Antes de enviar</h1>
    <div class="list">
      ${['Confira a agenda antes de confirmar qualquer horário.', 'Mande só para quem aceitou receber mensagens.', 'Não cole nome nem telefone de clientes no ChatGPT.'].map((t) => `<div class="it">${CHECK}<span>${t}</span></div>`).join('')}
    </div>
    <div class="spacer"></div>`, { n: '5/7' }),
  card(`<h1 style="font-size:76px;margin-top:6px">De onde vieram</h1>
    <div class="sub" style="margin:22px 0 34px;font-size:34px">Modelos 12 e 13 do Kit de Aplicação, em Word editável. São 20 modelos de mensagens, bônus do <b class="nw" style="color:#fff">VENDAMAIS IA</b>.</div>
    <div style="position:relative;flex:1;min-height:0;overflow:hidden;border-radius:22px;box-shadow:0 30px 70px rgba(0,0,0,.45)">
      <img class="shot" src="${IMG('pag-word.jpg')}" style="width:100%;border-radius:0">
      <div style="position:absolute;left:0;right:0;bottom:0;height:150px;background:linear-gradient(rgba(15,28,43,0),rgba(15,28,43,.92) 60%)"></div>
      <div style="position:absolute;left:22px;bottom:20px;background:rgba(23,40,59,.92);color:var(--rosa);font-weight:700;font-size:26px;padding:10px 20px;border-radius:99px">Na foto: página real dos 40 templates em Word</div>
    </div>`, { n: '6/7' }),
  card(`<h1 style="font-size:70px;margin-top:6px">Manda para quem responde <em>o WhatsApp aí</em></h1>
    <div class="spacer" style="min-height:30px"></div>
    <div class="mini">
      <div class="m"><b>1 · Logo depois de marcar</b>Seu horário está confirmado para ${ph('DATA')}, às ${ph('HORA')}, para ${ph('SERVIÇO')}.</div>
      <div class="m"><b>2 · Um dia antes</b>Passando para lembrar seu atendimento em ${ph('DATA')}, às ${ph('HORA')}. Está tudo certo?</div>
      <div class="m"><b>3 · Quando a cliente falta</b>Sentimos sua falta no horário de hoje. Posso ajudar a encontrar uma nova data?</div>
    </div>
    <div class="spacer" style="min-height:30px"></div>
    <div class="save">${SEND} Enviar para quem cuida do WhatsApp</div>`, { n: '7/7' }),
];

// ------------------------------------------------------------- QUINTA 26/11
const QUI = card(`
  <div class="eyebrow" style="margin-top:6px">Agenda cheia não é sobra no caixa</div>
  <h1 style="font-size:100px;margin-top:14px">Faturamento <em>não é lucro.</em></h1>
  <div style="position:relative;margin-top:50px">
    <img class="shot" src="${IMG('planilha.png')}" style="width:100%;padding:12px">
    <div class="selo" style="top:-24px;right:24px">Dados ilustrativos</div>
  </div>
  <div class="spacer"></div>
  <div style="display:flex;gap:20px;align-items:flex-start">
    <span style="flex:none;width:52px;height:52px;color:var(--champ);margin-top:4px">${CHAT}</span>
    <div class="sub" style="font-size:38px;color:#fff;font-weight:700">Você sabe quanto sobrou no mês passado, ou só quanto entrou?</div>
  </div>
`);

// ------------------------------------------------------------- SÁBADO 28/11
const ROTINA = [['10 min', 'Revisar mensagens, dúvidas e oportunidades'], ['10 min', 'Planejar ou ajustar os posts da semana'], ['5 min', 'Conferir vendas, despesas e compromissos'], ['5 min', 'Escolher uma melhoria pequena para testar']];
const SAB = card(`
  <div class="eyebrow" style="margin-top:6px">Rotina semanal · Kit de Aplicação</div>
  <h1 style="font-size:70px;margin-top:14px">30 minutos por semana para <em>não começar a segunda no susto</em></h1>
  <div class="spacer" style="min-height:40px"></div>
  <div class="table">
    <div class="row"><div class="hd">Tempo</div><div class="hd">O que fazer</div></div>
    ${ROTINA.map(([t, d]) => `<div class="row"><div class="t">${t}</div><div class="d">${d}</div></div>`).join('')}
  </div>
  <div class="spacer" style="min-height:40px"></div>
  <div class="save" style="font-size:32px">${SAVE} Salve e ponha um lembrete para todo sábado</div>`);

// ------------------------------------------------------------- TERÇA 24/11 (Reel 9:16)
const TALL = 'padding:250px 64px 300px'; // zona segura do Reels (interface em cima e embaixo)
const TER_CAPA = card(`<div class="spacer"></div>
    <div class="eyebrow">Black Friday · antes de anunciar</div>
    <h1 style="font-size:150px;margin-top:26px;line-height:1">A conta <em>do desconto</em></h1>
    <div class="sub" style="margin-top:44px;font-size:46px;color:#fff;font-weight:700">Vai dar 20% de desconto? Faz essa conta antes.</div>
    <div style="display:flex;gap:18px;margin-top:50px;flex-wrap:wrap">
      ${['Preço', 'Custo', 'Taxa', 'Margem'].map((t) => `<span style="background:rgba(255,255,255,.08);border:1.5px solid rgba(217,191,162,.5);font-weight:700;font-size:32px;padding:14px 28px;border-radius:99px">${t}</span>`).join('')}
    </div>
    <div class="spacer"></div>`, { h: 1920, style: TALL });
const TER_EXEMPLO = card(`<div class="spacer"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:20px">
      <div class="eyebrow">A conta do desconto</div>
      <div class="selo" style="position:static;font-size:28px">Exemplo ilustrativo</div>
    </div>
    <h1 style="font-size:84px;margin:30px 0 44px">Com 20% de desconto, <em>quanto sobra?</em></h1>
    <div class="calc">
      <div class="r">Preço do serviço <b>R$ 100</b></div>
      <div class="r">Custo direto + taxa <b>R$ 45</b></div>
      <div class="r">Sobra sem desconto <b>R$ 55</b></div>
      <div class="r hl">Sobra com 20% (preço R$ 80) <b>R$ 35</b></div>
    </div>
    <div class="warn" style="margin-top:40px;font-size:40px;line-height:1.35">Para sobrar o mesmo no total, é preciso atender cerca de <span style="color:var(--rosa);font-size:48px">57% mais clientes.</span></div>
    <div class="sub" style="margin-top:22px;font-size:32px">55 ÷ 35 = 1,57 · números ilustrativos, confira com os seus.</div>
    <div class="spacer"></div>`, { h: 1920, style: TALL });

// ------------------------------------------------------------- render
const JOBS = {
  seg: SEG.map((html, i) => [`seg-0${i + 1}.png`, 1350, html]),
  ter: [['ter-capa-reel.png', 1920, TER_CAPA], ['ter-exemplo.png', 1920, TER_EXEMPLO]],
  qua: QUA.map((html, i) => [`qua-0${i + 1}.png`, 1350, html]),
  qui: [['qui-01.png', 1350, QUI]],
  sab: [['sab-01.png', 1350, SAB]],
};

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: [...CHROME_ARGS, '--allow-file-access-from-files'] });
const pg = await browser.newPage();
const tmp = path.join(OUT, '_tmp.html');
try {
  for (const [dia, jobs] of Object.entries(JOBS)) {
    if (only.length && !only.includes(dia)) continue;
    for (const [name, h, html] of jobs) {
      fs.writeFileSync(tmp, page(1080, h, html));
      await pg.setViewport({ width: 1080, height: h, deviceScaleFactor: 1 });
      await pg.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
      await pg.evaluate(() => document.fonts.ready);
      // Aviso se algum texto estourar a área do card (conteúdo cortado).
      const over = await pg.evaluate(() => { const b = document.querySelector('.body'); return b.scrollHeight > b.clientHeight + 1; });
      if (over) console.warn('ATENÇÃO: conteúdo maior que o card em', name);
      await pg.screenshot({ path: path.join(OUT, name), clip: { x: 0, y: 0, width: 1080, height: h } });
      console.log('ok', name);
    }
  }
} finally {
  fs.rmSync(tmp, { force: true });
  await browser.close();
}
