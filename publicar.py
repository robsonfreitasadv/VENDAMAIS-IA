"""Monta o site para publicar (Cloudflare Pages ou outro serviço de hospedagem estática).

Gera:
  site/              só os arquivos públicos da página
  site.zip           o mesmo conteúdo, para enviar no Cloudflare Pages (upload direto)

Rode antes: python embutir.py
Nunca publique a raiz do repositório: ela contém o kit pago.

  python publicar.py --enviar   também publica no Cloudflare Pages (projeto vendamais-ia),
                                pela API, com a chave salva no ambiente (o proxy a injeta).
                                O wrangler não serve aqui: o proxy troca a chave temporária de upload dele.
"""
import hashlib, json, pathlib, shutil, subprocess, sys, zipfile

CONTA = 'e3f093d1d52e249920c64353209f167b'
PROJETO = 'vendamais-ia'

ROOT = pathlib.Path(__file__).parent
P = ROOT / 'pagina'
SITE = ROOT / 'site'
ZIP = ROOT / 'site.zip'
ARQUIVOS = ['index.html', 'obrigado.html', 'termos.html', 'privacidade.html', 'img/og.jpg']

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
    manifesto, campos = {}, []
    for rel in ARQUIVOS:
        h = hashlib.md5((SITE / rel).read_bytes()).hexdigest()
        manifesto['/' + rel] = h
        campos += ['-F', f'{h}=@{(SITE / rel).as_posix()}']
    url = f'https://api.cloudflare.com/client/v4/accounts/{CONTA}/pages/projects/{PROJETO}/deployments'
    r = subprocess.run(['curl', '-sS', '-X', 'POST', '-H', 'Authorization: Bearer proxy-injected', url,
                        '-F', 'manifest=' + json.dumps(manifesto), '-F', 'branch=main', *campos],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)
    if not d.get('success'):
        raise SystemExit(f"Falhou: {d.get('errors')}")
    print('publicado:', d['result']['url'], '-> https://vendamais-ia.pages.dev/')
