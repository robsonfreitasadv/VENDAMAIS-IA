"""Junta capa + miolo de cada módulo, gera o kit completo e prévias PNG.
Uso: python juntar.py [--preview id:pag,pag ...]
"""
import json, sys, pathlib
import fitz  # pymupdf

ROOT = pathlib.Path(__file__).parent
mods = json.loads((ROOT / 'modulos.json').read_text(encoding='utf-8'))
NOMES = {
    'manual': '00_VENDAMAIS_IA_Manual_de_Inicio_Rapido.pdf',
}
ordem = ['manual'] + [m['id'] for m in mods if m['id'] != 'manual' and m.get('formato') != 'word']
byid = {m['id']: m for m in mods}

def nome(m):
    if m['id'] in NOMES:
        return NOMES[m['id']]
    slug = m['title'].replace(' ', '_')
    for a, b in zip('áàâãéêíóôõúçÁÉÍÓÚÇ', 'aaaaeeiooouc' + 'AEIOUC'):
        slug = slug.replace(a, b)
    return f"{m['num']}_VENDAMAIS_IA_Modulo_{m['num']}_{slug}.pdf"

feitos = []
for mid in ordem:
    m = byid[mid]
    capa, miolo = ROOT / 'build' / f'{mid}-capa.pdf', ROOT / 'build' / f'{mid}-miolo.pdf'
    if not (capa.exists() and miolo.exists()):
        continue
    doc = fitz.open(capa)
    doc.insert_pdf(fitz.open(miolo))
    titulo = ('Módulo ' + m['num'] + ' — ' if m['num'] != '00' else '') + m['title']
    doc.set_metadata({'title': f'VENDAMAIS IA — {titulo}', 'author': 'VENDAMAIS IA', 'subject': m['subtitle']})
    doc.set_toc([[1, titulo, 1]])
    dest = ROOT / 'pdf' / nome(m)
    doc.save(dest, garbage=3, deflate=True)
    feitos.append((m, dest, doc.page_count))
    print(f'{dest.name}: {doc.page_count} páginas')

if len(feitos) == len(ordem):
    kit = fitz.open()
    toc = []
    for m, dest, n in feitos:
        start = kit.page_count + 1
        kit.insert_pdf(fitz.open(dest))
        toc.append([1, ('Módulo ' + m['num'] + ' — ' if m['num'] != '00' else '') + m['title'], start])
    kit.set_toc(toc)
    kit.set_metadata({'title': 'VENDAMAIS IA — Kit Completo', 'author': 'VENDAMAIS IA'})
    kit.save(ROOT / 'pdf' / 'VENDAMAIS_IA_Kit_Completo.pdf', garbage=3, deflate=True)
    print('Kit completo:', kit.page_count, 'páginas')

# prévias
args = sys.argv[1:]
if args and args[0] == '--preview':
    for spec in args[1:]:
        mid, pags = spec.split(':')
        d = next(dest for m, dest, n in feitos if m['id'] == mid)
        doc = fitz.open(d)
        for p in pags.split(','):
            i = int(p) - 1
            if i < doc.page_count:
                doc[i].get_pixmap(dpi=70).save(ROOT / 'preview' / f'{mid}-p{p}.png')
