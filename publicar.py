"""Monta o site para publicar (Cloudflare Pages ou outro serviço de hospedagem estática).

Gera:
  site/              só os arquivos públicos da página
  site.zip           o mesmo conteúdo, para enviar no Cloudflare Pages (upload direto)

Rode antes: python embutir.py
Nunca publique a raiz do repositório: ela contém o kit pago.

  python publicar.py --enviar   também publica no Cloudflare Pages (projeto vendamais-ia),
                                pela API, com a chave salva no ambiente (o proxy a injeta).
                                O wrangler e o envio normal de arquivos não servem aqui: o proxy troca a chave temporária de upload.
"""
import json, pathlib, shutil, subprocess, sys, zipfile

CONTA = 'e3f093d1d52e249920c64353209f167b'
PROJETO = 'vendamais-ia'

ROOT = pathlib.Path(__file__).parent
P = ROOT / 'pagina'
SITE = ROOT / 'site'
ZIP = ROOT / 'site.zip'
ARQUIVOS = ['index.html', 'obrigado.html', 'termos.html', 'privacidade.html', 'img/og.jpg',
            'robots.txt', 'sitemap.xml', 'llms.txt']

if SITE.exists():
    shutil.rmtree(SITE)
for rel in ARQUIVOS:
    dst = SITE / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(P / rel, dst)
if ZIP.exists():
    ZIP.unlink()
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for rel in ARQUIVOS:
        z.write(SITE / rel, rel)
for rel in ARQUIVOS:
    print(f'  {rel}  {(SITE / rel).stat().st_size / 1e3:.0f} KB')
print(f'zip: {ZIP.name} ({ZIP.stat().st_size / 1e3:.0f} KB)')

if '--enviar' in sys.argv:
    # As páginas vão embutidas num _worker.js do Pages (enviado no próprio pedido de publicação).
    # O envio normal de arquivos do Pages usa uma chave temporária que o proxy da nuvem substitui,
    # e a página fica com erro 500. Este caminho só usa a chave salva no ambiente.
    import base64
    ROTAS = {'/': 'index.html', '/index.html': 'index.html', '/obrigado': 'obrigado.html',
             '/obrigado.html': 'obrigado.html', '/termos': 'termos.html', '/termos.html': 'termos.html',
             '/privacidade': 'privacidade.html', '/privacidade.html': 'privacidade.html'}
    html = {f: (SITE / f).read_text(encoding='utf-8') for f in set(ROTAS.values())}
    TEXTOS = {'/robots.txt': ['robots.txt', 'text/plain; charset=utf-8'],
              '/sitemap.xml': ['sitemap.xml', 'application/xml; charset=utf-8'],
              '/llms.txt': ['llms.txt', 'text/plain; charset=utf-8']}
    textos = {r: [(SITE / f).read_text(encoding='utf-8'), t] for r, (f, t) in TEXTOS.items()}
    og = base64.b64encode((SITE / 'img/og.jpg').read_bytes()).decode()
    js = (f'const HTML = {json.dumps(html, ensure_ascii=False)};\n'
          f'const ROTAS = {json.dumps(ROTAS)};\n'
          f'const OG = {json.dumps(og)};\n'
          f'const TXT = {json.dumps(textos, ensure_ascii=False)};\n'
          """export default {
  async fetch(req) {
    const p = new URL(req.url).pathname;
    if (p === '/img/og.jpg') {
      const b = Uint8Array.from(atob(OG), c => c.charCodeAt(0));
      return new Response(b, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400' } });
    }
    if (TXT[p]) return new Response(TXT[p][0], { headers: { 'content-type': TXT[p][1], 'cache-control': 'public, max-age=3600' } });
    const f = ROTAS[p];
    if (!f) return new Response('Página não encontrada', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    return new Response(HTML[f], { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
  }
};
""")
    W = ROOT / 'site_worker.js'
    W.write_text(js, encoding='utf-8')
    url = f'https://api.cloudflare.com/client/v4/accounts/{CONTA}/pages/projects/{PROJETO}/deployments'
    r = subprocess.run(['curl', '-sS', '-X', 'POST', '-H', 'Authorization: Bearer proxy-injected', url,
                        '-F', 'manifest={}', '-F', 'branch=main',
                        '-F', f'_worker.js=@{W.as_posix()};type=application/javascript'],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)
    if not d.get('success'):
        raise SystemExit(f"Falhou: {d.get('errors')}")
    print('publicado:', d['result']['url'], '-> https://vendamais-ia.pages.dev/')
