// Caminho do Chrome/Chromium usado pelo Puppeteer, conforme o sistema.
// Windows: Chrome instalado. Linux (Claude Code na nuvem): Chromium em /opt/pw-browsers.
// Para outro caminho, defina a variável CHROME_PATH.
const WIN = process.platform === 'win32';
export const CHROME = process.env.CHROME_PATH
  || (WIN ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/opt/pw-browsers/chromium');
// No Linux o processo roda como root: o Chromium exige --no-sandbox.
export const CHROME_ARGS = WIN ? [] : ['--no-sandbox'];
