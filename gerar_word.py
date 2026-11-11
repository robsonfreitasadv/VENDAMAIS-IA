"""Gera os entregáveis em Word (.docx) do VENDAMAIS IA.

Para cada item de modulos.json com "formato": "word":
  - capa: build/<id>-capa.png (gerada por `node build.mjs <id>`)
  - conteúdo: conteudo/<source>.md (mesmas convenções dos PDFs)
  - saída: word/<arquivo>

Uso: node build.mjs kit-aplicacao templates-editaveis && python gerar_word.py
"""
import json, re, pathlib
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_BREAK, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = pathlib.Path(__file__).parent
NAVY, CHAMP, CHAMP_INK, ROSA, ROSA2, OFF, LINE, MUTED, PH = (
    '17283B', 'D9BFA2', '8A6B47', 'EBCFD1', 'F6E6E7', 'F7F3ED', 'E6DED3', '5B6670', '7A3E46')
SERIF, SANS = 'Georgia', 'Calibri'
SIGN = 'Seu pequeno negócio, com inteligência de gente grande.'


# ---------------------------------------------------------------- utilidades XML
def shade(el, color):
    pr = el._tc.get_or_add_tcPr() if hasattr(el, '_tc') else el._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), color)
    pr.append(shd)


def cell_borders(cell, **sides):
    """sides: top/bottom/left/right = (cor, espessura em oitavos de ponto) ou None (sem borda)."""
    tcPr = cell._tc.get_or_add_tcPr()
    b = OxmlElement('w:tcBorders')
    for side in ('top', 'left', 'bottom', 'right'):
        e = OxmlElement(f'w:{side}')
        v = sides.get(side)
        if v:
            e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), str(v[1])); e.set(qn('w:color'), v[0])
        else:
            e.set(qn('w:val'), 'nil')
        b.append(e)
    tcPr.append(b)


def cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    m = OxmlElement('w:tcMar')
    for k, v in (('top', top), ('bottom', bottom), ('start', left), ('end', right)):
        e = OxmlElement(f'w:{k}'); e.set(qn('w:w'), str(v)); e.set(qn('w:type'), 'dxa'); m.append(e)
    tcPr.append(m)


def run_shade(run, color):
    rPr = run._r.get_or_add_rPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), color)
    rPr.append(shd)


def no_split(table):
    for row in table.rows:
        trPr = row._tr.get_or_add_trPr()
        cs = OxmlElement('w:cantSplit'); trPr.append(cs)


def keep_next(p):
    p.paragraph_format.keep_with_next = True


def fmt(p, before=0, after=4, line=1.15):
    pf = p.paragraph_format
    pf.space_before = Pt(before); pf.space_after = Pt(after); pf.line_spacing = line


def add_runs(p, text, size=10.5, color='1F2933', bold=False, font=SANS, placeholders=True):
    """Texto com **negrito** e [CAMPOS] destacados."""
    parts = re.split(r'(\*\*[^*]+\*\*)', text)
    for part in parts:
        if not part:
            continue
        b = bold
        if part.startswith('**') and part.endswith('**'):
            part, b = part[2:-2], True
        chunks = re.split(r'(\[[^\]\n]+\])', part) if placeholders else [part]
        for ch in chunks:
            if not ch:
                continue
            r = p.add_run(ch)
            r.font.name = font; r.font.size = Pt(size); r.bold = b
            r._r.get_or_add_rPr().get_or_add_rFonts().set(qn('w:hAnsi'), font)
            if placeholders and ch.startswith('[') and ch.endswith(']'):
                r.font.color.rgb = RGBColor.from_string(PH); r.bold = True; run_shade(r, ROSA2)
            else:
                r.font.color.rgb = RGBColor.from_string(NAVY if b and color == '1F2933' else color)
    return p


def one_cell(doc, fill, left=None, border_all=None):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.cell(0, 0)
    if fill:
        shade(c, fill)
    if border_all:
        cell_borders(c, top=border_all, bottom=border_all, right=border_all, left=left or border_all)
    else:
        cell_borders(c, left=left)
    cell_margins(c)
    no_split(t)
    c.paragraphs[0].text = ''
    return t, c


def spacer(doc, pts=4):
    p = doc.add_paragraph(); fmt(p, 0, 0, 1.0)
    r = p.add_run(' '); r.font.size = Pt(pts)
    return p


# ---------------------------------------------------------------- blocos
def section_band(doc, raw, first):
    if not first:
        spacer(doc, 6)
    eyebrow, title = (raw.split(' — ', 1) + [None])[:2] if ' — ' in raw else (None, raw)
    if title is None:
        eyebrow, title = None, raw
    t, c = one_cell(doc, NAVY)
    cell_margins(c, 200, 200, 260, 260)
    p = c.paragraphs[0]; fmt(p, 0, 0); keep_next(p)
    if eyebrow:
        add_runs(p, eyebrow.upper(), 8, CHAMP, True, SANS, False)
        p = c.add_paragraph(); fmt(p, 2, 0); keep_next(p)
    add_runs(p, title, 17, 'FFFFFF', True, SERIF, False)
    keep_next(spacer(doc, 6))


def item_heading(doc, raw):
    tag, title = raw.split(' — ', 1) if ' — ' in raw else (None, raw)
    p = doc.add_paragraph(); fmt(p, 10, 4); keep_next(p)
    if tag:
        r = p.add_run(f' {tag.upper()} '); r.font.name = SANS; r.font.size = Pt(8); r.bold = True
        r.font.color.rgb = RGBColor.from_string(NAVY); run_shade(r, ROSA)
        p.add_run('  ')
    add_runs(p, title, 13, NAVY, True, SERIF, False)


def subheading(doc, text):
    p = doc.add_paragraph(); fmt(p, 8, 3); keep_next(p)
    add_runs(p, text, 11, NAVY, True)


def paragraph(doc, text):
    p = doc.add_paragraph(); fmt(p, 0, 5)
    add_runs(p, text)
    if re.match(r'^\*\*[^*]+:\*\*', text):
        keep_next(p)


def list_item(doc, text, prefix, checkbox=False):
    p = doc.add_paragraph(); fmt(p, 0, 3)
    pf = p.paragraph_format; pf.left_indent = Cm(0.7); pf.first_line_indent = Cm(-0.55)
    r = p.add_run(('☐' if checkbox else prefix) + '\t')
    r.font.name = SANS; r.font.size = Pt(10.5 if not checkbox else 12)
    r.font.color.rgb = RGBColor.from_string(CHAMP_INK); r.bold = True
    pf.tab_stops.add_tab_stop(Cm(0.7))
    add_runs(p, text)


def box(doc, kind, lines):
    if kind == 'prompt':
        t, c = one_cell(doc, OFF, left=(CHAMP, 24))
        label = 'COPIE E COLE NO CHATGPT OU GEMINI'
    elif kind == 'modelo':
        t, c = one_cell(doc, 'FFFFFF', left=(ROSA, 24), border_all=(LINE, 6))
        label = 'MODELO PARA COPIAR E ADAPTAR'
    else:  # nota
        t, c = one_cell(doc, ROSA2)
        label = None
    p = c.paragraphs[0]; fmt(p, 0, 3)
    if label:
        add_runs(p, label, 7, CHAMP_INK, True, SANS, False)
        p = None
    for ln in lines:
        if p is None:
            p = c.add_paragraph(); fmt(p, 0, 2, 1.2)
        m = re.match(r'^(- |\d+\. )(.*)', ln)
        if m:
            p.paragraph_format.left_indent = Cm(0.4)
        add_runs(p, ln, 10)
        p = None
    spacer(doc, 4)


def table(doc, rows):
    head, body = rows[0], rows[1:]
    t = doc.add_table(rows=1 + len(body), cols=len(head))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(head):
        c = t.cell(0, j); shade(c, NAVY); cell_margins(c, 90, 90, 120, 120)
        cell_borders(c)
        p = c.paragraphs[0]; fmt(p, 0, 0); add_runs(p, h.replace('**', ''), 9.5, 'FFFFFF', True, SANS, False)
    for i, row in enumerate(body, start=1):
        for j in range(len(head)):
            c = t.cell(i, j); cell_margins(c, 80, 80, 120, 120)
            cell_borders(c, bottom=(LINE, 6))
            if i % 2 == 0:
                shade(c, 'FBF8F4')
            p = c.paragraphs[0]; fmt(p, 0, 0)
            add_runs(p, row[j] if j < len(row) else '', 9.5)
    # repete o cabeçalho e não parte linhas
    trPr = t.rows[0]._tr.get_or_add_trPr(); h = OxmlElement('w:tblHeader'); trPr.append(h)
    no_split(t)
    spacer(doc, 4)


def closing(doc, disclaimer):
    spacer(doc, 10)
    t, c = one_cell(doc, NAVY)
    cell_margins(c, 260, 260, 300, 300)
    p = c.paragraphs[0]; fmt(p, 0, 4)
    add_runs(p, 'VENDAMAIS ', 13, 'FFFFFF', True, SANS, False); add_runs(p, 'IA', 13, CHAMP, True, SANS, False)
    p = c.add_paragraph(); fmt(p, 2, 6)
    r = p.add_run(SIGN); r.italic = True; r.font.name = SERIF; r.font.size = Pt(12); r.font.color.rgb = RGBColor.from_string('FFFFFF')
    p = c.add_paragraph(); fmt(p, 0, 0)
    add_runs(p, disclaimer, 8.5, 'C7D0D9', False, SANS, False)


# ---------------------------------------------------------------- markdown → docx
def parse_table(lines):
    rows = []
    for ln in lines:
        cells = [x.strip() for x in ln.strip().strip('|').split('|')]
        if all(re.fullmatch(r':?-{2,}:?', x) for x in cells):
            continue
        rows.append(cells)
    return rows


def render(doc, md):
    lines = md.split('\n')
    i, first = 0, True
    while i < len(lines):
        ln = lines[i]
        if ln.startswith('## '):
            section_band(doc, ln[3:].strip(), first); first = False
        elif ln.startswith('### '):
            item_heading(doc, ln[4:].strip())
        elif ln.startswith('#### '):
            subheading(doc, ln[5:].strip())
        elif ln.startswith('```'):
            kind = ln[3:].strip() or 'nota'
            body = []
            i += 1
            while not lines[i].startswith('```'):
                if lines[i].strip():
                    body.append(lines[i])
                i += 1
            box(doc, kind, body)
        elif ln.startswith('|'):
            block = []
            while i < len(lines) and lines[i].startswith('|'):
                block.append(lines[i]); i += 1
            table(doc, parse_table(block)); continue
        elif ln.startswith('> '):
            block = []
            while i < len(lines) and lines[i].startswith('>'):
                block.append(lines[i].lstrip('> ').replace('<br>', '')); i += 1
            box(doc, 'nota', [' '.join(block)]); continue
        elif ln.startswith('- [ ] '):
            list_item(doc, ln[6:], '', checkbox=True)
        elif ln.startswith('- '):
            list_item(doc, ln[2:], '•')
        elif re.match(r'^\d+\. ', ln):
            n, rest = ln.split('. ', 1)
            list_item(doc, rest, n + '.')
        elif ln.strip():
            # junta linhas seguidas do mesmo parágrafo
            para = [ln.strip()]
            while i + 1 < len(lines) and lines[i + 1].strip() and not re.match(r'^(#|```|\||> |- |\d+\. )', lines[i + 1]):
                i += 1; para.append(lines[i].strip())
            paragraph(doc, ' '.join(para))
        i += 1


def summary(doc, md, m):
    groups = []
    for ln in md.split('\n'):
        if ln.startswith('## '):
            groups.append([ln[3:].strip(), []])
        elif ln.startswith('### ') and groups:
            groups[-1][1].append(ln[4:].strip())
    groups = [g for g in groups if g[1]]
    p = doc.add_paragraph(); fmt(p, 0, 2)
    add_runs(p, 'Neste documento', 24, NAVY, True, SERIF, False)
    p = doc.add_paragraph(); fmt(p, 0, 12)
    add_runs(p, m['subtitle'], 10.5, MUTED, False, SANS, False)
    for title, items in groups:
        p = doc.add_paragraph(); fmt(p, 8, 2); keep_next(p)
        add_runs(p, title.replace(' — ', ' · '), 10.5, NAVY, True)
        pPr = p._p.get_or_add_pPr(); bdr = OxmlElement('w:pBdr'); b = OxmlElement('w:bottom')
        b.set(qn('w:val'), 'single'); b.set(qn('w:sz'), '8'); b.set(qn('w:color'), CHAMP); bdr.append(b); pPr.append(bdr)
        half = (len(items) + 1) // 2
        t = doc.add_table(rows=half, cols=2)
        for k, it in enumerate(items):
            c = t.cell(k, 0) if k < half else t.cell(k - half, 1)
            cell_borders(c); cell_margins(c, 20, 20, 0, 120)
            q = c.paragraphs[0]; fmt(q, 0, 0)
            tag, name = it.split(' — ', 1) if ' — ' in it else ('', it)
            num = (re.findall(r'\d+', tag) or [''])[0]
            if num:
                add_runs(q, num + '  ', 9, CHAMP_INK, True, SANS, False)
            add_runs(q, name, 9, '1F2933', False, SANS, False)
    p = doc.add_paragraph(); p.add_run().add_break(WD_BREAK.PAGE)


def footer(section, m):
    section.footer.is_linked_to_previous = False
    f = section.footer.paragraphs[0]; f.text = ''
    f.paragraph_format.tab_stops.add_tab_stop(section.page_width - section.left_margin - section.right_margin, WD_TAB_ALIGNMENT.RIGHT)
    add_runs(f, 'VENDAMAIS IA', 8, NAVY, True, SANS, False)
    add_runs(f, f'  ·  {m["title"]}\t', 8, CHAMP_INK, False, SANS, False)
    fld = OxmlElement('w:fldSimple'); fld.set(qn('w:instr'), 'PAGE')
    r = OxmlElement('w:r'); rpr = OxmlElement('w:rPr'); sz = OxmlElement('w:sz'); sz.set(qn('w:val'), '16'); rpr.append(sz)
    t = OxmlElement('w:t'); t.text = '1'; r.append(rpr); r.append(t); fld.append(r); f._p.append(fld)


def build(m):
    md = (ROOT / 'conteudo' / f"{m['source']}.md").read_text(encoding='utf-8')
    doc = Document()
    st = doc.styles['Normal']; st.font.name = SANS; st.font.size = Pt(10.5)
    st.element.rPr.rFonts.set(qn('w:eastAsia'), SANS)
    cp = doc.core_properties
    cp.title = f"VENDAMAIS IA — {m['title']}"; cp.author = 'VENDAMAIS IA'; cp.subject = m['subtitle']

    # capa: seção sem margens
    s0 = doc.sections[0]
    s0.page_width, s0.page_height = Cm(21), Cm(29.7)
    for a in ('top_margin', 'bottom_margin', 'left_margin', 'right_margin'):
        setattr(s0, a, Cm(0))
    s0.header_distance = s0.footer_distance = Cm(0)
    p = doc.add_paragraph(); fmt(p, 0, 0, 1.0)
    p.add_run().add_picture(str(ROOT / 'build' / f"{m['id']}-capa.png"), width=Cm(20.99), height=Cm(29.65))

    # conteúdo
    s1 = doc.add_section(WD_SECTION.NEW_PAGE)
    s1.top_margin = s1.bottom_margin = Cm(2); s1.left_margin = s1.right_margin = Cm(2)
    s1.header_distance = s1.footer_distance = Cm(1)
    footer(s1, m)
    summary(doc, md, m)
    render(doc, md)
    closing(doc, m['disclaimer'])

    out = ROOT / 'word' / m['arquivo']
    out.parent.mkdir(exist_ok=True)
    doc.save(out)
    print('ok', out.name)


if __name__ == '__main__':
    for m in json.loads((ROOT / 'modulos.json').read_text(encoding='utf-8')):
        if m.get('formato') == 'word':
            build(m)
