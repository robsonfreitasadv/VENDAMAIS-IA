// Gera os criativos de anúncio do VENDAMAIS IA (Meta: Facebook e Instagram).
// Uso: node anuncios/criativos.mjs [S01 C02 ...]   → anuncios/out/*.png
//      node anuncios/criativos.mjs --video [S01 ...] → anuncios/out/videos/S0x_reels_1080x1920.mp4 (12 s, 9:16, sem áudio)
// Regras: só material real do kit; sem escassez falsa, sem preço riscado, sem promessa de resultado.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { CHROME, CHROME_ARGS } from '../chrome.mjs';

const DIR = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const IMG = (f) => 'file:///' + path.join(DIR, 'img', f).replace(/\\/g, '/');
const OUT = path.join(DIR, 'out');
const VIDEO = process.argv.includes('--video');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">';
const LOGO = `<svg viewBox="0 0 64 64"><rect x="6" y="40" width="9" height="18" rx="2" fill="#D9BFA2"/><rect x="20" y="31" width="9" height="27" rx="2" fill="#D9BFA2"/><rect x="34" y="22" width="9" height="36" rx="2" fill="#D9BFA2"/><rect x="48" y="12" width="9" height="46" rx="2" fill="#D9BFA2"/><path d="M6 30 L24 16 L34 22 L54 5" fill="none" stroke="#EBCFD1" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M46 5 L55 4 L54 13" fill="none" stroke="#EBCFD1" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const BRAND = (s = 30) => `<div class="brand" style="font-size:${s}px">${LOGO}<span>VENDAMAIS <b>IA</b></span></div>`;
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 7l5 5-5 5"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--navy:#17283B;--navy2:#0F1C2B;--champ:#D9BFA2;--champ-ink:#8A6B47;--rosa:#EBCFD1;--rosa2:#F6E6E7;--off:#F7F3ED;--pink:#C2185B;--pink2:#D81B60;--ok:#2E7D5B;--ink:#1F2933;--muted:#5B6670}
body{font-family:Montserrat,sans-serif;-webkit-font-smoothing:antialiased;color:#fff}
.c{position:relative;overflow:hidden;display:flex;flex-direction:column;padding:72px 72px 64px}
.dark{background:radial-gradient(900px 700px at 85% 0%,#2C4864 0%,var(--navy) 48%,var(--navy2) 100%)}
.light{background:var(--off);color:var(--ink)}
.brand{display:flex;align-items:center;gap:.45em;font-weight:800;letter-spacing:.02em}
.brand svg{width:1.6em;height:1.6em}.brand b{color:var(--champ)}
.light .brand{color:var(--navy)}
.eyebrow{font-size:24px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--champ)}
.light .eyebrow{color:var(--champ-ink)}
h1{font-family:'Playfair Display',serif;font-weight:800;line-height:1.05;letter-spacing:-.015em}
h1 em{font-style:normal;color:var(--champ)}
.light h1{color:var(--navy)}.light h1 em{color:var(--pink)}
.sub{font-size:31px;line-height:1.35;color:#D6DEE6;font-weight:500}
.light .sub{color:var(--muted)}
.cta{display:inline-flex;align-items:center;gap:18px;background:linear-gradient(90deg,var(--pink2),var(--pink));color:#fff;font-weight:800;font-size:34px;padding:24px 40px 24px 46px;border-radius:99px;box-shadow:0 14px 36px rgba(194,24,91,.45);align-self:flex-start}
.cta svg{width:38px;height:38px}
.meta{display:flex;gap:26px;font-size:22px;font-weight:600;color:#B8C4D0;margin-top:20px}
.light .meta{color:var(--muted)}
.meta span::before{content:"✓ ";color:var(--champ)}
.light .meta span::before{color:var(--ok)}
.spacer{flex:1}
/* chat */
.phone{background:#0B141A;border-radius:44px;padding:26px;box-shadow:0 30px 70px rgba(0,0,0,.5),0 0 0 3px #2A3942}
.phone .bar{display:flex;align-items:center;gap:16px;padding:6px 8px 20px;border-bottom:1px solid #22313A;margin-bottom:22px}
.phone .av{width:58px;height:58px;border-radius:50%;background:var(--rosa);color:var(--navy);display:grid;place-items:center;font-weight:800;font-size:26px}
.phone .nm{font-weight:700;font-size:26px;color:#E9EDEF}.phone .st{font-size:19px;color:#8696A0}
.msg{max-width:82%;font-size:28px;line-height:1.35;padding:18px 22px;border-radius:24px;margin-bottom:16px;position:relative}
.in{background:#202C33;color:#E9EDEF;border-top-left-radius:6px}
.out{background:#005C4B;color:#E9EDEF;margin-left:auto;border-top-right-radius:6px}
.msg small{display:block;text-align:right;font-size:18px;color:#8FB3AA;margin-top:6px}
.in small{color:#8696A0}
.seen{font-size:20px;color:#8696A0;text-align:center;margin-top:8px}
/* antes/depois */
.ba{display:flex;flex-direction:column;gap:22px}
.bub{border-radius:30px;padding:28px 32px;font-size:30px;line-height:1.38;position:relative}
.bub .lb{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px}
.bub .lb svg{width:28px;height:28px}
.bad{background:#2A3542;color:#C4CDD6}.bad .lb{color:#F28B9B}
.good{background:#FFFFFF;color:#1E3A2F;box-shadow:0 20px 50px rgba(0,0,0,.35)}.good .lb{color:var(--ok)}
.light .bad{background:#E9E6E1;color:#52525B}.light .bad .lb{color:#B4233C}
/* cards genéricos */
.card{background:#fff;color:var(--ink);border-radius:32px;box-shadow:0 24px 60px rgba(0,0,0,.25)}
.prompt{background:var(--off);color:var(--ink);border-left:8px solid var(--champ);border-radius:0 28px 28px 0;padding:30px 36px;font-size:29px;line-height:1.45}
.prompt .lbl{font-size:19px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--champ-ink);margin-bottom:12px}
.ph{background:var(--rosa2);color:#7A3E46;font-weight:700;border-radius:6px;box-shadow:0 0 0 4px var(--rosa2)}
.pill{display:inline-block;background:var(--champ);color:var(--navy);font-weight:800;font-size:24px;padding:10px 22px;border-radius:99px}
.shot{border-radius:22px;box-shadow:0 30px 70px rgba(0,0,0,.45);background:#fff}
.tag-il{position:absolute;right:18px;bottom:18px;background:rgba(23,40,59,.9);color:var(--rosa);font-weight:700;font-size:19px;padding:8px 16px;border-radius:99px}
.swipe{display:flex;align-items:center;gap:12px;font-weight:700;font-size:24px;color:var(--champ)}
.swipe svg{width:30px;height:30px}
.num{position:absolute;top:56px;right:64px;font-weight:700;font-size:22px;color:rgba(255,255,255,.45)}
.light .num{color:rgba(23,40,59,.35)}
.cov{position:absolute;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.1)}
.grid8{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.grid8 img{width:100%;border-radius:10px;box-shadow:0 14px 30px rgba(0,0,0,.4)}
.chips{display:flex;flex-wrap:wrap;gap:12px}
.chips span{background:rgba(255,255,255,.08);border:1.5px solid rgba(217,191,162,.45);color:#fff;font-weight:700;font-size:24px;padding:10px 20px;border-radius:99px}
.week{display:grid;grid-template-columns:120px 1fr;gap:0;border-radius:28px;overflow:hidden;background:#fff;color:var(--ink);box-shadow:0 24px 60px rgba(0,0,0,.3)}
.week div{padding:17px 24px;font-size:25px;border-bottom:1px solid #EEE7DD}
.week .d{background:var(--navy);color:var(--champ);font-weight:800;border-bottom-color:#22384F}
.agenda{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.agenda .h{font-weight:800;font-size:22px;text-align:center;color:var(--champ);padding-bottom:6px}
.agenda .s{height:58px;border-radius:12px;background:var(--rosa);}
.agenda .e{height:58px;border-radius:12px;border:2.5px dashed rgba(217,191,162,.55)}
`;

const page = (w, h, body) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${FONTS}<style>${CSS}</style></head><body style="width:${w}px;height:${h}px">${body}</body></html>`;
const ctaBlock = (txt, meta = ['Download imediato', '7 dias de garantia']) =>
  `<div class="cta">${txt} ${ARROW}</div><div class="meta">${meta.map((m) => `<span>${m}</span>`).join('')}</div>`;
const offerLine = 'VENDAMAIS IA · R$ 67 · pagamento único';

// ------------------------------------------------------------- ESTÁTICOS (4:5 e 9:16)
const ST = {
  S01: (tall) => `<div class="c dark" style="width:1080px;height:${tall ? 1920 : 1350}px;${tall ? 'padding-top:150px;padding-bottom:230px' : ''}">
    ${BRAND(30)}
    <div class="spacer" style="min-height:36px"></div>
    <h1 style="font-size:${tall ? 92 : 84}px">Ela perguntou o preço.<br>Você respondeu.<br><em>Ela sumiu.</em></h1>
    <div style="height:${tall ? 70 : 40}px"></div>
    <div class="phone" style="width:${tall ? 900 : 860}px;align-self:center">
      <div class="bar"><div class="av">C</div><div><div class="nm">Cliente nova</div><div class="st">visto por último hoje às 19:42</div></div></div>
      <div class="msg in">Oi! Quanto custa o design de sobrancelha? <small>19:40</small></div>
      <div class="msg out">R$ 45. <small>19:41 ✓✓</small></div>
      <div class="seen">· · · sem resposta · · ·</div>
    </div>
    <div class="spacer"></div>
    <div class="sub" style="font-size:${tall ? 40 : 36}px;color:#fff;font-weight:700">O problema não foi o preço.<br>Foi a resposta.</div>
    <div class="sub" style="margin:14px 0 30px">65 respostas prontas para o WhatsApp do seu negócio de beleza.</div>
    ${ctaBlock('Quero as respostas')}
  </div>`,

  S02: (tall) => `<div class="c dark" style="width:1080px;height:${tall ? 1920 : 1350}px;${tall ? 'padding-top:150px;padding-bottom:230px' : ''}">
    ${BRAND(30)}
    <div class="spacer" style="min-height:36px"></div>
    <div class="eyebrow">A cliente escreveu:</div>
    <h1 style="font-size:${tall ? 104 : 96}px;margin-top:10px">“Achei caro.”</h1>
    <div class="sub" style="margin-top:14px">O que você responde?</div>
    <div style="height:${tall ? 70 : 40}px"></div>
    <div class="ba">
      <div class="bub bad" style="font-size:34px"><div class="lb">${X} Afasta</div>“Mas é o nosso preço. Se quiser, é esse.”</div>
      <div class="bub good" style="font-size:34px"><div class="lb">${CHECK} Aproxima</div>“Entendo perfeitamente! É importante escolher um serviço que faça sentido para você. Posso explicar melhor o que está incluído para você avaliar com tranquilidade?”</div>
    </div>
    <div class="spacer"></div>
    <div class="sub" style="margin-bottom:30px">Exemplo real do Módulo 02 do <b style="color:#fff">VENDAMAIS IA</b> — 65 situações do WhatsApp, do primeiro “oi” ao pós-atendimento.</div>
    ${ctaBlock('Ver o kit')}
  </div>`,

  S03: (tall) => `<div class="c light" style="width:1080px;height:${tall ? 1920 : 1350}px;${tall ? 'padding-top:150px;padding-bottom:230px' : ''}">
    ${BRAND(30)}
    <div class="spacer" style="min-height:36px"></div>
    <h1 style="font-size:${tall ? 92 : 82}px">Sem saber o que postar <em>amanhã?</em></h1>
    <div class="sub" style="margin-top:18px">Um comando pronto. A semana inteira planejada.</div>
    <div style="height:${tall ? 60 : 36}px"></div>
    <div class="week">
      ${[['SEG', 'Dica educativa'], ['TER', 'Apresentação de serviço'], ['QUA', 'Bastidores'], ['QUI', 'Pergunta e resposta'], ['SEX', 'Agenda da semana'], ['SÁB', 'Avaliação de cliente (autorizada)'], ['DOM', 'Enquete leve']].map(([d, t]) => `<div class="d">${d}</div><div>${t}</div>`).join('')}
    </div>
    <div class="spacer"></div>
    <div class="sub" style="margin-bottom:30px">Copie, troque o que está entre colchetes e cole no ChatGPT ou no Gemini. Mais de 220 comandos prontos para negócios de beleza.</div>
    ${ctaBlock('Quero os comandos')}
  </div>`,

  S04: (tall) => `<div class="c dark" style="width:1080px;height:${tall ? 1920 : 1350}px;${tall ? 'padding-top:150px;padding-bottom:230px' : ''}">
    ${BRAND(30)}
    <div class="spacer" style="min-height:36px"></div>
    <h1 style="font-size:${tall ? 100 : 92}px">Terça-feira <em>vazia</em><br>de novo?</h1>
    <div style="height:${tall ? 70 : 44}px"></div>
    <div class="agenda">
      ${['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d) => `<div class="h">${d}</div>`).join('')}
      ${[0, 1, 2, 3, 4].map((r) => ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d, i) => {
        const full = { 0: [0, 1], 1: [], 2: [0, 2], 3: [1, 3], 4: [0, 1, 2], 5: [0, 1, 2, 3, 4] }[i].includes(r);
        return `<div class="${full ? 's' : 'e'}"></div>`;
      }).join('')).join('')}
    </div>
    <div class="spacer"></div>
    <div class="sub" style="font-size:${tall ? 40 : 36}px;color:#fff;font-weight:700">30 campanhas prontas para movimentar os dias fracos.</div>
    <div class="sub" style="margin:14px 0 30px">Combos, indicação, clientes antigos e Stories — com cuidado para não queimar sua margem com desconto.</div>
    ${ctaBlock('Ver as campanhas')}
  </div>`,

  S05: (tall) => `<div class="c light" style="width:1080px;height:${tall ? 1920 : 1350}px;${tall ? 'padding-top:150px;padding-bottom:230px' : ''}">
    ${BRAND(30)}
    <div class="spacer" style="min-height:36px"></div>
    <h1 style="font-size:${tall ? 88 : 80}px">Aquela cliente que não volta <em>há 3 meses.</em></h1>
    <div class="sub" style="margin-top:18px">Dá para chamar sem parecer insistente.</div>
    <div style="height:${tall ? 60 : 36}px"></div>
    <div class="bub good" style="font-size:36px;box-shadow:0 20px 50px rgba(23,40,59,.18);border:2px solid #E6DED3">
      <div class="lb">${CHECK} Mensagem pronta · Módulo 04</div>
      “Oi, [nome]! Tudo bem? Passando para saber como você está e dizer que será um prazer receber você novamente aqui no [nome do salão]. Se quiser consultar nossos horários, é só me chamar!”
    </div>
    <div class="spacer"></div>
    <div class="sub" style="margin-bottom:30px">Mensagens para 30, 60 e 90 dias sem visita — e uma planilha que mostra quem está na hora de chamar.</div>
    ${ctaBlock('Quero as mensagens')}
  </div>`,

  S06: (tall) => `<div class="c dark" style="width:1080px;height:${tall ? 1920 : 1350}px;${tall ? 'padding-top:150px;padding-bottom:230px' : ''}">
    ${BRAND(30)}
    <div class="spacer" style="min-height:36px"></div>
    <h1 style="font-size:${tall ? 80 : 70}px">Marketing, WhatsApp e vendas do seu negócio de beleza — <em>com IA, sem agência.</em></h1>
    <div style="position:relative;height:${tall ? 640 : 470}px;margin-top:${tall ? 50 : 26}px">
      <img class="cov" src="${IMG('capa-01.jpg')}" style="width:${tall ? 300 : 230}px;left:20px;top:${tall ? 90 : 70}px;transform:rotate(-9deg)">
      <img class="cov" src="${IMG('capa-02.jpg')}" style="width:${tall ? 300 : 230}px;left:${tall ? 170 : 140}px;top:${tall ? 40 : 30}px;transform:rotate(-3deg)">
      <img class="cov" src="${IMG('capa-00.jpg')}" style="width:${tall ? 330 : 255}px;left:${tall ? 330 : 270}px;top:0;transform:rotate(4deg);box-shadow:0 30px 60px rgba(0,0,0,.55),0 0 0 3px #D9BFA2;z-index:3">
      <div style="position:absolute;right:0;top:${tall ? 120 : 80}px;width:${tall ? 470 : 420}px;z-index:2"><img class="shot" src="${IMG('planilha.png')}" style="width:100%;padding:8px"><div class="tag-il">Planilha · dados ilustrativos</div></div>
    </div>
    <div class="chips" style="margin-top:${tall ? 40 : 18}px">
      <span>8 módulos + manual</span><span>+220 comandos</span><span>30 campanhas</span><span>40 templates</span><span>Plano de 30 dias</span><span>Planilha de gestão</span>
    </div>
    <div class="spacer"></div>
    <div style="display:flex;align-items:baseline;gap:18px;margin-bottom:26px"><span style="font-family:'Playfair Display',serif;font-size:${tall ? 104 : 92}px;font-weight:800;color:#fff">R$ 67</span><span class="sub">pagamento único</span></div>
    ${ctaBlock('Comprar agora')}
  </div>`,
};

// ------------------------------------------------------------- CARROSSÉIS (1:1)
const sq = (inner, cls = 'dark', n = '', extra = '') => `<div class="c ${cls}" style="width:1080px;height:1080px;padding:64px;${extra}">${n ? `<div class="num">${n}</div>` : ''}${inner}</div>`;
const offerCard = (title, n) => sq(`
  ${BRAND(30)}
  <h1 style="font-size:66px;margin-top:40px">${title}</h1>
  <div class="chips" style="margin-top:26px"><span>8 módulos + manual</span><span>+220 comandos</span><span>30 campanhas</span><span>40 templates</span><span>Planilha de gestão</span></div>
  <div style="position:relative;flex:1;min-height:260px">
    ${['01', '02', '00', '06', '08'].map((n, i) => `<img class="cov" src="${IMG(`capa-${n}.jpg`)}" style="width:${n === '00' ? 190 : 165}px;left:${150 + i * 135}px;top:${[38, 18, 0, 18, 38][i]}px;transform:rotate(${[-9, -4, 0, 4, 9][i]}deg);z-index:${n === '00' ? 9 : i}${n === '00' ? ';box-shadow:0 24px 50px rgba(0,0,0,.55),0 0 0 3px #D9BFA2' : ''}">`).join('')}
  </div>
  <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:24px"><span style="font-family:'Playfair Display',serif;font-size:84px;font-weight:800">R$ 67</span><span class="sub">pagamento único</span></div>
  ${ctaBlock('Comprar agora')}`, 'dark', n);

const BA = [
  ['A cliente pergunta o preço da sobrancelha', '“R$ 45.”', '“Olá! O design de sobrancelhas custa R$ 45. Se quiser, posso consultar os horários desta semana. Prefere manhã ou tarde?”'],
  ['“Achei um pouco caro.”', '“Mas é o nosso preço. Se quiser, é esse.”', '“Entendo! Posso explicar o que está incluído para você avaliar com tranquilidade?”'],
  ['“Vou pensar e depois vejo.”', '“Tá bom.”', '“Claro! Fique à vontade. Se surgir alguma dúvida, estou por aqui. Será um prazer receber você.”'],
  ['A cliente faltou ao horário', '“Você não veio. Quer remarcar?”', '“Olá! Sentimos sua falta hoje. Espero que esteja tudo bem. Posso ajudar a encontrar uma nova data?”'],
  ['“Não gostei do atendimento.”', '“Mas fizemos tudo certo.”', '“Lamentamos que não tenha sido como esperava. Queremos entender o que aconteceu. Posso encaminhar ao responsável?”'],
];

const CA = {
  C01: [
    sq(`${BRAND(28)}<div class="spacer"></div>
      <div class="eyebrow">Salvar para usar hoje</div>
      <h1 style="font-size:92px;margin-top:16px">5 respostas de WhatsApp que <em>aproximam</em> a cliente.</h1>
      <div class="spacer"></div><div class="swipe">Arraste para ver ${ARROW}</div>`, 'dark', '1/7'),
    ...BA.map(([q, bad, good], i) => sq(`
      <div class="eyebrow">Situação ${i + 1}</div>
      <h1 style="font-size:66px;margin:14px 0 40px">${q}</h1>
      <div class="ba">
        <div class="bub bad" style="font-size:36px"><div class="lb">${X} Afasta</div>${bad}</div>
        <div class="bub good" style="font-size:36px"><div class="lb">${CHECK} Aproxima</div>${good}</div>
      </div>`, 'dark', `${i + 2}/7`, 'justify-content:center')),
    offerCard('Essas são 5 de <em>65 respostas prontas</em> do VENDAMAIS IA.', '7/7'),
  ],
  C02: [
    sq(`${BRAND(28)}<div class="spacer"></div>
      <h1 style="font-size:90px">Cole isto no ChatGPT e planeje <em>a semana de posts.</em></h1>
      <div class="sub" style="margin-top:22px">Funciona também no Gemini. Gratuito.</div>
      <div class="spacer"></div><div class="swipe">Arraste ${ARROW}</div>`, 'dark', '1/6'),
    sq(`<div class="eyebrow">Copie</div><h1 style="font-size:56px;margin:12px 0 30px">O comando</h1>
      <div class="prompt" style="font-size:36px"><div class="lbl">Módulo 01 · Comando 05</div>Crie um calendário de conteúdo para sete dias para meu negócio de beleza. Considere os seguintes serviços: <span class="ph">[SERVIÇOS]</span>. Para cada dia, sugira uma publicação ou sequência de Stories, com tema, texto principal, formato e chamada para ação. Evite repetir assuntos.</div>`, 'dark', '2/6', 'justify-content:center'),
    sq(`<div class="eyebrow">Troque</div><h1 style="font-size:56px;margin:12px 0 30px">O que está entre colchetes vira o seu negócio</h1>
      <div class="ba">
        <div class="bub bad" style="font-size:38px"><div class="lb">Antes</div>Considere os seguintes serviços: <span class="ph">[SERVIÇOS]</span>.</div>
        <div class="bub good" style="font-size:38px"><div class="lb">${CHECK} Depois</div>Considere os seguintes serviços: <b>corte, escova, coloração e hidratação</b>.</div>
      </div>`, 'dark', '3/6', 'justify-content:center'),
    sq(`<div class="eyebrow">Cole e revise</div><h1 style="font-size:62px;margin:12px 0 36px">A IA devolve a semana com:</h1>
      <div class="week" style="grid-template-columns:1fr">
        ${['Tema de cada dia', 'Texto principal', 'Formato: post, Stories ou Reels', 'Chamada para ação', 'Sem repetir assunto'].map((t) => `<div style="font-size:38px;padding:26px 34px">✓ ${t}</div>`).join('')}
      </div>
      <div class="sub" style="margin-top:26px;font-size:26px">Revise sempre antes de publicar: a IA pode errar.</div>`, 'dark', '4/6', 'justify-content:center'),
    sq(`<div class="spacer"></div><h1 style="font-size:96px">Esse é <em>1</em> de mais de <em>220</em> comandos.</h1>
      <div class="sub" style="margin-top:26px">Instagram, WhatsApp, vendas, clientes que sumiram, finanças e campanhas — prontos para negócios de beleza.</div><div class="spacer"></div>`, 'dark', '5/6'),
    offerCard('Todos os comandos, organizados por situação.', '6/6'),
  ],
  C03: [
    sq(`${BRAND(28)}
      <div style="position:relative;height:520px;margin-top:40px">
        ${['01', '02', '03', '06', '08'].map((n, i) => `<img class="cov" src="${IMG(`capa-${n}.jpg`)}" style="width:250px;left:${40 + i * 140}px;top:${[60, 30, 10, 30, 60][i]}px;transform:rotate(${[-10, -5, 0, 5, 10][i]}deg);z-index:${i}">`).join('')}
      </div>
      <h1 style="font-size:76px">Abri o kit para você ver <em>por dentro.</em></h1>
      <div class="spacer"></div><div class="swipe">Arraste ${ARROW}</div>`, 'dark', '1/6'),
    sq(`<div class="eyebrow">8 módulos + manual em PDF</div><h1 style="font-size:52px;margin:12px 0 34px">163 páginas, organizadas por situação do dia a dia</h1>
      <div class="grid8">${['01', '02', '03', '04', '05', '06', '07', '08'].map((n) => `<img src="${IMG(`capa-${n}.jpg`)}">`).join('')}</div>`, 'dark', '2/6'),
    sq(`<div class="eyebrow">Cada comando num quadro</div><h1 style="font-size:52px;margin:12px 0 30px">Pronto para copiar, com os campos destacados</h1>
      <div style="height:640px;overflow:hidden;border-radius:22px"><img class="shot" src="${IMG('pag-m02.jpg')}" style="width:100%"></div>`, 'dark', '3/6'),
    sq(`<div class="eyebrow">Bônus · Planilha de Gestão</div><h1 style="font-size:52px;margin:12px 0 30px">Faturamento, despesas, conversão e quem está na hora de voltar</h1>
      <div style="position:relative"><img class="shot" src="${IMG('planilha.png')}" style="width:100%;padding:10px"><div class="tag-il">Dados meramente ilustrativos</div></div>`, 'dark', '4/6'),
    sq(`<div class="eyebrow">Arquivos editáveis em Word</div><h1 style="font-size:52px;margin:12px 0 30px">40 templates e 20 modelos de mensagens para preencher</h1>
      <div style="height:640px;overflow:hidden;border-radius:22px"><img class="shot" src="${IMG('pag-word.jpg')}" style="width:100%"></div>`, 'dark', '5/6'),
    offerCard('Tudo isso por <em>R$ 67</em>, com 7 dias de garantia.', '6/6'),
  ],
  C04: [
    sq(`${BRAND(28)}<div class="spacer"></div>
      <h1 style="font-size:90px">30 dias.<br>15 a 30 minutos por dia.<br><em>Um negócio mais organizado.</em></h1>
      <div class="spacer"></div><div class="swipe">Veja o plano ${ARROW}</div>`, 'dark', '1/6'),
    ...[
      ['Semana 1', 'Organize a casa', ['Diagnóstico do negócio', 'Ficha para a IA conhecer você', 'Cliente ideal e diferenciais', 'Perfil do Instagram revisado']],
      ['Semana 2', 'Apareça', ['Estratégia de conteúdo', 'Posts e Stories prontos', 'Roteiro de Reels', 'Primeira campanha']],
      ['Semana 3', 'Atenda e venda', ['Respostas rápidas no WhatsApp', 'Roteiro de atendimento', 'Respostas para objeções', 'Uma oferta que cabe na margem']],
      ['Semana 4', 'Fidelize e organize', ['Pós-venda', 'Reativação de clientes', 'Indicadores na planilha', 'Plano para os próximos 90 dias']],
    ].map(([w, t, items], i) => sq(`
      <div class="eyebrow">${w}</div>
      <h1 style="font-size:84px;margin:12px 0 44px">${t}</h1>
      <div class="week" style="grid-template-columns:1fr">${items.map((x) => `<div style="font-size:40px;padding:30px 36px">✓ ${x}</div>`).join('')}</div>
      <div class="sub" style="font-size:26px;margin-top:30px">Cada dia indica o comando exato a usar · Módulo 08</div>`, 'dark', `${i + 2}/6`, 'justify-content:center')),
    offerCard('O plano completo, dia a dia, no <em>VENDAMAIS IA</em>.', '6/6'),
  ],
};

// ------------------------------------------------------------- render
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: [...CHROME_ARGS, '--allow-file-access-from-files'] });
const pg = await browser.newPage();
async function shot(name, w, h, html) {
  const file = path.join(OUT, '_tmp.html');
  fs.writeFileSync(file, page(w, h, html));
  await pg.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await pg.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(OUT, name), clip: { x: 0, y: 0, width: w, height: h } });
}
fs.mkdirSync(OUT, { recursive: true });
if (VIDEO) {
  // Vídeo vertical: os elementos do estático 9:16 entram em sequência e o botão pulsa no fim.
  const { spawn } = await import('node:child_process');
  const FPS = 24, DUR = 12;
  const VOUT = path.join(OUT, 'videos');
  fs.mkdirSync(VOUT, { recursive: true });
  for (const [id, fn] of Object.entries(ST)) {
    if (only.length && !only.includes(id)) continue;
    const file = path.join(OUT, '_tmp.html');
    fs.writeFileSync(file, page(1080, 1920, fn(true)));
    await pg.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await pg.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 60000 });
    await pg.evaluate(() => document.fonts.ready);
    await pg.evaluate(() => {
      const root = document.querySelector('.c');
      const GRUPOS = ['phone', 'ba', 'week', 'agenda', 'chips'];
      const beats = [];
      let gancho = true; // marca e título já visíveis no 1º quadro (gancho e miniatura)
      for (const el of root.children) {
        if (el.classList.contains('spacer') || (!el.textContent.trim() && !el.querySelector('img'))) continue;
        if (gancho) { if (el.tagName === 'H1') gancho = false; continue; }
        if (GRUPOS.some((g) => el.classList.contains(g)) || el.querySelector(':scope > img.cov')) {
          el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 0, fill: 'both' }).pause();
          el.dataset.grupo = '1';
          beats.push([el, ...el.children]);
        } else beats.push([el]);
      }
      let t = 500;
      for (const grupo of beats) {
        const passo = grupo.length > 20 ? 35 : grupo.length > 4 ? 110 : 260;
        grupo.forEach((el, i) => el.dataset.grupo ? el.getAnimations()[0].effect.updateTiming({ delay: t }) : el.animate(
          [{ opacity: 0, transform: (el.style.transform || '') + ' translateY(36px)' }, { opacity: 1, transform: (el.style.transform || '') + ' translateY(0)' }],
          { duration: 500, delay: t + i * passo, fill: 'both', easing: 'cubic-bezier(.2,.7,.2,1)' }));
        t += 380 + (grupo.length - 1) * passo;
      }
      const cta = root.querySelector('.cta');
      if (cta) cta.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
        { duration: 900, delay: t + 300, iterations: 8, easing: 'ease-in-out' });
      document.getAnimations().forEach((a) => a.pause());
      window.__t = t;
    });
    const out = path.join(VOUT, `${id}_reels_1080x1920.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-movflags', '+faststart', out]);
    const fim = new Promise((ok, erro) => ff.on('close', (c) => (c === 0 ? ok() : erro(new Error('ffmpeg ' + c)))));
    for (let f = 0; f < FPS * DUR; f++) {
      await pg.evaluate((ms) => document.getAnimations().forEach((a) => { a.currentTime = ms; }), (f * 1000) / FPS);
      const buf = await pg.screenshot({ type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await fim;
    console.log('ok video', id, path.relative(DIR, out));
  }
} else {
for (const [id, fn] of Object.entries(ST)) {
  if (only.length && !only.includes(id)) continue;
  await shot(`${id}_feed_1080x1350.png`, 1080, 1350, fn(false));
  await shot(`${id}_stories_1080x1920.png`, 1080, 1920, fn(true));
  console.log('ok', id);
}
for (const [id, cards] of Object.entries(CA)) {
  if (only.length && !only.includes(id)) continue;
  for (let i = 0; i < cards.length; i++) await shot(`${id}_card${i + 1}_1080x1080.png`, 1080, 1080, cards[i]);
  console.log('ok', id, cards.length, 'cards');
}
}
fs.rmSync(path.join(OUT, '_tmp.html'), { force: true });
await browser.close();
