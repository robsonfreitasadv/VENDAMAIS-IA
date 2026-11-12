"""Monta o site para publicar (Cloudflare Pages ou outro serviço de hospedagem estática).

Gera:
  site/              só os arquivos públicos da página
  site.zip           o mesmo conteúdo, para enviar no Cloudflare Pages (upload direto)

Rode antes: python embutir.py
Nunca publique a raiz do repositório: ela contém o kit pago.
"""
import pathlib, shutil, zipfile

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
