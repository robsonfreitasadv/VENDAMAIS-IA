"""Monta o pacote de entrega do VENDAMAIS IA.

Gera:
  entrega/VENDAMAIS_IA/            pasta com os arquivos organizados (para subir um a um na plataforma)
  entrega/VENDAMAIS_IA_v1.zip      o mesmo conteúdo em um único ZIP

Rode depois de gerar PDFs, Word e planilha:
  node build.mjs && python juntar.py && node build.mjs kit-aplicacao templates-editaveis && python gerar_word.py
  python empacotar.py
"""
import pathlib, shutil, zipfile

ROOT = pathlib.Path(__file__).parent
PASTA = ROOT / 'entrega' / 'VENDAMAIS_IA'
ZIP = ROOT / 'entrega' / 'VENDAMAIS_IA_v1.zip'

ARQUIVOS = {
    '1_Comece_aqui': ['pdf/00_VENDAMAIS_IA_Manual_de_Inicio_Rapido.pdf'],
    '2_Modulos_PDF': [f'pdf/{n}' for n in sorted(p.name for p in (ROOT / 'pdf').glob('0[1-8]_*.pdf'))],
    '3_Arquivos_editaveis': ['word/VENDAMAIS_IA_Modulo_07_Templates_Editaveis.docx'],
    '4_Bonus': ['planilha/VENDAMAIS_IA_Planilha_de_Gestao.xlsx', 'word/VENDAMAIS_IA_Bonus_Kit_de_Aplicacao.docx'],
    '5_Tudo_em_um_arquivo': ['pdf/VENDAMAIS_IA_Kit_Completo.pdf'],
}

if PASTA.exists():
    shutil.rmtree(PASTA)
PASTA.mkdir(parents=True)

# LEIA-ME com BOM UTF-8 para abrir certo no Bloco de Notas do Windows
leia = (ROOT / 'entrega_modelo' / 'LEIA-ME.txt').read_text(encoding='utf-8').replace('\n', '\r\n')
(PASTA / 'LEIA-ME.txt').write_bytes(b'\xef\xbb\xbf' + leia.encode('utf-8'))

faltando = []
for pasta, lista in ARQUIVOS.items():
    (PASTA / pasta).mkdir()
    for rel in lista:
        src = ROOT / rel
        if not src.exists():
            faltando.append(rel); continue
        shutil.copy2(src, PASTA / pasta / src.name)
if faltando:
    raise SystemExit('Arquivos faltando: ' + ', '.join(faltando))
if len(ARQUIVOS['2_Modulos_PDF']) != 8:
    raise SystemExit(f"Esperava 8 módulos em PDF, achei {len(ARQUIVOS['2_Modulos_PDF'])}")

if ZIP.exists():
    ZIP.unlink()
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in sorted(PASTA.rglob('*')):
        if f.is_file():
            z.write(f, 'VENDAMAIS_IA/' + f.relative_to(PASTA).as_posix())

total = sum(f.stat().st_size for f in PASTA.rglob('*') if f.is_file())
print(f'pasta: {PASTA.relative_to(ROOT)} ({total / 1e6:.1f} MB)')
print(f'zip:   {ZIP.relative_to(ROOT)} ({ZIP.stat().st_size / 1e6:.1f} MB)')
for f in sorted(PASTA.rglob('*')):
    if f.is_file():
        print('  ', f.relative_to(PASTA).as_posix(), f'{f.stat().st_size / 1e3:.0f} KB')
