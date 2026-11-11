"""Gera a versão 2 da Planilha de Gestão VENDAMAIS IA a partir de original.xlsx.
Uso: python ajustar.py [--teste]   (--teste preenche dados fictícios para conferência)
"""
import sys, datetime as dt
from copy import copy
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.chart import BarChart, LineChart, Reference
from openpyxl.worksheet.datavalidation import DataValidation

TESTE = '--teste' in sys.argv
wb = openpyxl.load_workbook('original.xlsx')

NAVY = '17283B'
F_INPUT = PatternFill('solid', fgColor='FBEFD9')
F_AUTO = PatternFill('solid', fgColor='F3F4F6')
F_ZEBRA = PatternFill('solid', fgColor='F7F3ED')
THIN = Side(style='thin', color='D9BFA2')
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
LINE = Border(bottom=Side(style='thin', color='E6DED3'))
BRL = '"R$" #,##0.00'
PCT = '0.0%'
DATE = 'dd/mm/yyyy'
N = 204  # última linha de dados nas abas de registro

def style_like(dst, src):
    dst.font = copy(src.font); dst.fill = copy(src.fill)
    dst.alignment = copy(src.alignment); dst.border = copy(src.border)

def header(ws, col, text, ref='A4'):
    c = ws[f'{col}4']; c.value = text; style_like(c, ws[ref])

def auto_col(ws, col, first, last, fmt=None):
    for r in range(first, last + 1):
        c = ws[f'{col}{r}']; c.fill = F_AUTO
        if fmt: c.number_format = fmt

# ---------------------------------------------------------------- Vendas
v = wb['Vendas']
v['A2'] = ('Uma linha por venda. Preencha data, cliente/código, produto/serviço, canal, quantidade, preço, desconto e status. '
           'Só entram no faturamento as vendas com status "Concluída". A coluna Total é automática (cinza).')
auto_col(v, 'H', 5, N, BRL)

# ---------------------------------------------------------------- Despesas
d = wb['Despesas']
d['A2'] = ('Registre despesas fixas e variáveis com data, categoria e tipo. Inclua somente valores efetivamente incorridos — '
           'o Painel separa fixas e variáveis e filtra pelo período escolhido.')

# ---------------------------------------------------------------- Clientes
c = wb['Clientes']
c['A2'] = ('Use código ou primeiro nome/apelido. Não registre dados sensíveis. Informe a data da última compra/visita: '
           'as colunas cinza calculam há quantos dias o cliente não volta e sugerem a ação (Módulo 04).')
header(c, 'H', 'Dias sem visita')
header(c, 'I', 'Situação')
header(c, 'J', 'Observações não sensíveis')
c.column_dimensions['H'].width = 15
c.column_dimensions['I'].width = 24
c.column_dimensions['J'].width = 35
c.merged_cells.ranges = [r for r in c.merged_cells.ranges if str(r) not in ('A1:H1', 'A2:H2')]
c.merge_cells('A1:J1'); c.merge_cells('A2:J2')
for r in range(5, N + 1):
    c[f'E{r}'].number_format = DATE
    c[f'H{r}'] = f'=IF(E{r}="","",MAX(0,TODAY()-E{r}))'
    c[f'I{r}'] = (f'=IF(H{r}="","",IF(H{r}<=30,"Ativo",IF(H{r}<=60,"Atenção (31–60 dias)",'
                  f'IF(H{r}<=90,"Reativar (61–90 dias)","Inativo (90+ dias)"))))')
    c[f'H{r}'].number_format = '0'
auto_col(c, 'H', 5, N); auto_col(c, 'I', 5, N)

# ---------------------------------------------------------------- Campanhas
k = wb['Campanhas']
k['A2'] = ('Registre campanhas e acompanhe os resultados. As colunas cinza são automáticas. '
           'Retorno compara receita e custo — receita não é lucro. Não confunda alcance com vendas.')
header(k, 'J', 'Conversão (vendas ÷ contatos)')
header(k, 'K', 'Custo por venda (R$)')
header(k, 'L', 'Retorno ((receita − custo) ÷ custo)')
header(k, 'M', 'Observações')
for col, w in zip('JKLM', (18, 17, 20, 30)):
    k.column_dimensions[col].width = w
k.merged_cells.ranges = [r for r in k.merged_cells.ranges if str(r) not in ('A1:J1', 'A2:J2')]
k.merge_cells('A1:M1'); k.merge_cells('A2:M2')
for r in range(5, 105):
    k[f'C{r}'].number_format = DATE
    k[f'F{r}'].number_format = BRL; k[f'I{r}'].number_format = BRL
    k[f'J{r}'] = f'=IF(OR(G{r}="",H{r}="",G{r}=0),"",H{r}/G{r})'
    k[f'K{r}'] = f'=IF(OR(F{r}="",H{r}="",H{r}=0),"",F{r}/H{r})'
    k[f'L{r}'] = f'=IF(OR(F{r}="",I{r}="",F{r}=0),"",(I{r}-F{r})/F{r})'
auto_col(k, 'J', 5, 104, PCT); auto_col(k, 'K', 5, 104, BRL); auto_col(k, 'L', 5, 104, PCT)

# ---------------------------------------------------------------- Precificação
p = wb['Precificação']
p['A2'] = ('Estimativa inicial. Informe custos e percentuais (ex.: 10 para 10%). O preço sugerido cobre custos, taxas e a margem desejada; '
           'informe o preço que você pratica hoje para ver a margem real. Valide impostos e taxas com seu contador.')
header(p, 'G', 'Preço praticado (R$)')
header(p, 'H', 'Margem no preço praticado (%)')
header(p, 'I', 'Observações')
for col, w in zip('GHI', (19, 22, 32)):
    p.column_dimensions[col].width = w
p.merged_cells.ranges = [r for r in p.merged_cells.ranges if str(r) not in ('A1:G1', 'A2:G2')]
p.merge_cells('A1:I1'); p.merge_cells('A2:I2')
for r in range(5, 55):
    p[f'G{r}'] = None
    p[f'G{r}'].number_format = BRL
    p[f'H{r}'] = (f'=IF(OR(G{r}="",B{r}="",G{r}=0),"",'
                  f'(G{r}*(1-IF(D{r}="",0,D{r})/100)-B{r}-IF(C{r}="",0,C{r}))/G{r}*100)')
    p[f'H{r}'].number_format = '0.0'
auto_col(p, 'F', 5, 54); auto_col(p, 'H', 5, 54, '0.0')

# ---------------------------------------------------------------- Painel
pn = wb['Painel']
title_font, desc_font = copy(pn['A1'].font), copy(pn['A2'].font)
title_fill = copy(pn['A1'].fill)
label_font = copy(pn['A5'].font); value_font = copy(pn['B5'].font)
hdr = copy(v['A4'].font), copy(v['A4'].fill), copy(v['A4'].alignment)
for rng in list(pn.merged_cells.ranges):
    pn.unmerge_cells(str(rng))
for row in pn.iter_rows(min_row=1, max_row=60, max_col=12):
    for cell in row:
        cell.value = None; cell.fill = PatternFill(); cell.border = Border(); cell.number_format = 'General'

pn['A1'] = 'PAINEL DE ACOMPANHAMENTO'; pn['A1'].font = title_font; pn['A1'].fill = title_fill
pn.merge_cells('A1:I1')
for col in 'BCDEFGHI': pn[f'{col}1'].fill = title_fill
pn['A2'] = ('Tudo nesta aba é automático, exceto as células amarelas. Escolha o período (ou deixe em branco para considerar tudo) '
            'e informe quantos contatos comerciais recebeu para calcular a conversão.')
pn['A2'].font = desc_font; pn['A2'].alignment = Alignment(wrap_text=True, vertical='top')
pn.merge_cells('A2:I2'); pn.row_dimensions[2].height = 30

def hdr_row(r, labels):
    for i, t in enumerate(labels):
        cell = pn.cell(row=r, column=1 + i, value=t)
        cell.font, cell.fill, cell.alignment = copy(hdr[0]), copy(hdr[1]), copy(hdr[2])

# filtros
hdr_row(4, ['Período e dados de entrada', 'Preencha'])
inputs = [
    (5, 'Data inicial (em branco = desde o início)', None, DATE),
    (6, 'Data final (em branco = até hoje e depois)', None, DATE),
    (7, 'Contatos comerciais recebidos no período', None, '0'),
]
for r, lab, val, fmt in inputs:
    pn[f'A{r}'] = lab; pn[f'A{r}'].font = copy(label_font); pn[f'A{r}'].border = LINE
    cell = pn[f'B{r}']; cell.value = val; cell.fill = F_INPUT; cell.border = BOX; cell.number_format = fmt
    cell.protection = copy(cell.protection); cell.protection = openpyxl.styles.Protection(locked=False)

dv_date = DataValidation(type='date', operator='greaterThan', formula1='36526', allow_blank=True,
                         error='Informe uma data válida (dd/mm/aaaa).', showErrorMessage=True)
dv_int = DataValidation(type='whole', operator='greaterThanOrEqual', formula1='0', allow_blank=True,
                        error='Informe um número inteiro maior ou igual a zero.', showErrorMessage=True)
pn.add_data_validation(dv_date); pn.add_data_validation(dv_int)
dv_date.add('B5:B6'); dv_int.add('B7')

# critérios de período reutilizáveis
def per(rng_date):
    return f',{rng_date},">="&IF($B$5="",1,$B$5),{rng_date},"<="&IF($B$6="",2958465,$B$6)'

VD, VH, VI, VE = f'Vendas!$A$5:$A${N}', f'Vendas!$H$5:$H${N}', f'Vendas!$I$5:$I${N}', f'Vendas!$E$5:$E${N}'
DD, DE, DT = f'Despesas!$A$5:$A${N}', f'Despesas!$E$5:$E${N}', f'Despesas!$D$5:$D${N}'
ALL = 'AND($B$5="",$B$6="")'

def fat(extra_crit=''):
    return (f'IF({ALL},SUMIFS({VH},{VI},"Concluída"{extra_crit}),'
            f'SUMIFS({VH},{VI},"Concluída"{extra_crit}{per(VD)}))')

def cnt(status):
    return f'IF({ALL},COUNTIFS({VI},"{status}"),COUNTIFS({VI},"{status}"{per(VD)}))'

def desp(tipo=None):
    t = f',{DT},"{tipo}"' if tipo else ''
    base = f'SUMIFS({DE}{t})' if tipo else f'SUM({DE})'
    return f'IF({ALL},{base},SUMIFS({DE}{t}{per(DD)}))'

hdr_row(9, ['Indicador', 'Valor', 'Como é calculado'])
pn.merge_cells('C9:F9')
rows = [
    ('Faturamento de vendas concluídas', '=' + fat(), BRL, 'Soma do Total das vendas com status "Concluída" no período.'),
    ('Despesas fixas', '=' + desp('Fixa'), BRL, 'Despesas do tipo "Fixa" no período.'),
    ('Despesas variáveis', '=' + desp('Variável'), BRL, 'Despesas do tipo "Variável" no período.'),
    ('Despesas totais', '=' + desp(), BRL, 'Todas as despesas registradas no período (inclui as sem tipo).'),
    ('Resultado simples estimado', '=B10-B13', BRL, 'Faturamento − despesas totais. Não é DRE nem lucro contábil.'),
    ('Margem do resultado', '=IFERROR(B14/B10,"—")', PCT, 'Resultado ÷ faturamento.'),
    ('Vendas concluídas', '=' + cnt('Concluída'), '0', 'Quantidade de vendas com status "Concluída".'),
    ('Ticket médio', '=IFERROR(B10/B16,0)', BRL, 'Faturamento ÷ vendas concluídas.'),
    ('Vendas canceladas ou reembolsadas', f'={cnt("Cancelada")}+{cnt("Reembolsada")}', '0', 'Acompanhe para identificar problemas.'),
    ('Taxa de conversão', '=IF($B$7="","Informe os contatos em B7",IFERROR(B16/$B$7,"—"))', PCT,
     'Vendas concluídas ÷ contatos comerciais informados em B7.'),
    ('Clientes cadastrados', f'=COUNTA(Clientes!$A$5:$A${N})', '0', 'Linhas preenchidas com código na aba Clientes.'),
    ('Clientes para reativar (61 a 90 dias)', f'=COUNTIF(Clientes!$I$5:$I${N},"Reativar*")', '0', 'Use as ferramentas 07 a 10 do Módulo 04.'),
    ('Clientes inativos (90+ dias)', f'=COUNTIF(Clientes!$I$5:$I${N},"Inativo*")', '0', 'Use a ferramenta 09 do Módulo 04.'),
    ('Campanhas cadastradas', '=COUNTA(Campanhas!$A$5:$A$104)', '0', 'Linhas preenchidas na aba Campanhas.'),
    ('Retorno das campanhas', '=IFERROR((SUM(Campanhas!$I$5:$I$104)-SUM(Campanhas!$F$5:$F$104))/SUM(Campanhas!$F$5:$F$104),"—")', PCT,
     '(Receita − custo) ÷ custo de todas as campanhas. Receita não é lucro.'),
]
for i, (lab, f, fmt, how) in enumerate(rows):
    r = 10 + i
    pn[f'A{r}'] = lab; pn[f'A{r}'].font = copy(label_font)
    pn[f'B{r}'] = f; pn[f'B{r}'].number_format = fmt; pn[f'B{r}'].font = copy(value_font)
    pn[f'B{r}'].alignment = Alignment(horizontal='right')
    pn[f'C{r}'] = how; pn[f'C{r}'].font = Font(name='Aptos', size=9, color='667085')
    pn.merge_cells(f'C{r}:F{r}')
    for col in 'ABCDEF':
        pn[f'{col}{r}'].border = LINE
        if i % 2: pn[f'{col}{r}'].fill = F_ZEBRA
last_ind = 10 + len(rows) - 1  # 24

# resumo mensal
R0 = last_ind + 3  # 27
pn[f'A{R0}'] = 'RESUMO MENSAL'; pn[f'A{R0}'].font = Font(name='Aptos Display', size=13, bold=True, color=NAVY)
pn[f'A{R0+1}'] = 'Ano de referência'; pn[f'A{R0+1}'].font = copy(label_font)
yc = pn[f'B{R0+1}']; yc.value = '=YEAR(TODAY())'; yc.fill = F_INPUT; yc.border = BOX; yc.number_format = '0'
yc.protection = openpyxl.styles.Protection(locked=False)
pn[f'C{R0+1}'] = 'Mostra o ano atual. Para ver outro ano, digite-o (ex.: 2025).'
pn[f'C{R0+1}'].font = Font(name='Aptos', size=9, color='667085')
H = R0 + 3  # cabeçalho
hdr_row(H, ['Mês', 'Faturamento', 'Despesas', 'Resultado', 'Vendas concluídas'])
MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
Y = f'$B${R0+1}'
for m in range(1, 13):
    r = H + m
    ini, fim = f'DATE({Y},{m},1)', f'DATE({Y},{m+1 if m < 12 else 1},1)-1' if m < 12 else f'DATE({Y},12,31)'
    pn[f'A{r}'] = MESES[m - 1]
    pn[f'B{r}'] = f'=SUMIFS({VH},{VI},"Concluída",{VD},">="&{ini},{VD},"<="&{fim})'
    pn[f'C{r}'] = f'=SUMIFS({DE},{DD},">="&{ini},{DD},"<="&{fim})'
    pn[f'D{r}'] = f'=B{r}-C{r}'
    pn[f'E{r}'] = f'=COUNTIFS({VI},"Concluída",{VD},">="&{ini},{VD},"<="&{fim})'
    for col, fmt in zip('BCDE', (BRL, BRL, BRL, '0')):
        pn[f'{col}{r}'].number_format = fmt
    for col in 'ABCDE':
        pn[f'{col}{r}'].border = LINE
        if m % 2 == 0: pn[f'{col}{r}'].fill = F_ZEBRA
T = H + 13
pn[f'A{T}'] = 'Total do ano'
for col in 'BCDE':
    pn[f'{col}{T}'] = f'=SUM({col}{H+1}:{col}{H+12})'
    pn[f'{col}{T}'].number_format = BRL if col != 'E' else '0'
for col in 'ABCDE':
    pn[f'{col}{T}'].font = Font(bold=True, color=NAVY)
    pn[f'{col}{T}'].border = Border(top=Side(style='medium', color=NAVY))

bar = BarChart(); bar.type = 'col'; bar.grouping = 'clustered'
bar.title = None
bar.add_data(Reference(pn, min_col=2, max_col=3, min_row=H, max_row=H + 12), titles_from_data=True)
bar.set_categories(Reference(pn, min_col=1, min_row=H + 1, max_row=H + 12))
bar.series[0].graphicalProperties.solidFill = NAVY
bar.series[1].graphicalProperties.solidFill = 'D9BFA2'
bar.y_axis.numFmt = '"R$" #,##0'; bar.y_axis.majorGridlines = None
bar.y_axis.title = None; bar.legend.position = 't'
line = LineChart()
line.add_data(Reference(pn, min_col=4, min_row=H, max_row=H + 12), titles_from_data=True)
line.series[0].graphicalProperties.line.solidFill = 'C2185B'
line.series[0].graphicalProperties.line.width = 28000
line.series[0].smooth = False
bar += line
bar.height, bar.width = 9.5, 17
bar.x_axis.delete = False; bar.y_axis.delete = False
bar.x_axis.tickLblPos = 'low'
pn.add_chart(bar, f'G{R0}')

pn[f'A{T+2}'] = ('Atenção: o resultado simples considera apenas as despesas registradas na planilha e não substitui DRE, '
                 'apuração contábil ou cálculo de tributos. Confira se todos os lançamentos do período foram incluídos.')
pn[f'A{T+2}'].font = Font(name='Aptos', size=9, italic=True, color='667085')
pn[f'A{T+2}'].alignment = Alignment(wrap_text=True, vertical='top')
pn.merge_cells(f'A{T+2}:F{T+3}')

for col, w in zip('ABCDEFGHI', (40, 20, 18, 18, 18, 14, 12, 12, 12)):
    pn.column_dimensions[col].width = w
pn.freeze_panes = 'A4'
pn.protection.sheet = True  # sem senha: evita apagar fórmulas por engano
pn.protection.formatColumns = False
pn.sheet_view.showGridLines = False

# ---------------------------------------------------------------- Comece aqui
s = wb['Comece aqui']
s['B4'] = 'Preencha as abas Vendas, Despesas, Clientes, Calendário editorial e Campanhas conforme sua rotina. Células cinza são automáticas.'
s['B5'] = 'Use uma linha por venda, despesa, cliente, publicação ou campanha. Sempre informe a data e o status. Não apague as colunas cinza.'
s['B6'] = ('No Painel, escolha o período (células amarelas) e informe os contatos recebidos para ver faturamento, despesas fixas e variáveis, '
           'resultado, ticket médio, conversão, clientes a reativar e o gráfico mensal.')
s['B7'] = 'As listas suspensas podem ser ajustadas conforme os serviços e a operação do seu negócio. O Painel é protegido sem senha (Revisão › Desproteger Planilha).'
for r in range(4, 10):
    s.row_dimensions[r].height = 32

# ---------------------------------------------------------------- dados de teste
if TESTE:
    hoje = dt.date.today()
    y = hoje.year
    vendas = [
        (dt.date(y, 1, 10), 'C001', 'Corte', 'Instagram', 1, 80, None, 'Concluída'),
        (dt.date(y, 1, 15), 'C002', 'Escova', 'WhatsApp', 2, 60, 10, 'Concluída'),
        (dt.date(y, 2, 3), 'C003', 'Coloração', 'Indicação', 1, 250, None, 'Cancelada'),
        (dt.date(y, 2, 20), 'C001', 'Manicure', 'WhatsApp', 1, 45, None, 'Concluída'),
        (dt.date(y, 3, 5), 'C004', 'Design de sobrancelhas', 'Instagram', 1, 45, 5, 'Concluída'),
        (dt.date(y - 1, 12, 20), 'C005', 'Corte', 'Loja física', 1, 80, None, 'Concluída'),
        (dt.date(y, 3, 28), 'C006', 'Hidratação', 'Site', 1, 120, None, 'Reembolsada'),
    ]
    for i, row in enumerate(vendas):
        for j, val in enumerate(row):
            if val is not None:
                v.cell(row=5 + i, column=[1, 2, 3, 4, 5, 6, 7, 9][j], value=val)
    desps = [
        (dt.date(y, 1, 5), 'Aluguel', 'Aluguel', 'Fixa', 300),
        (dt.date(y, 1, 20), 'Esmaltes', 'Material/insumos', 'Variável', 40),
        (dt.date(y, 2, 5), 'Aluguel', 'Aluguel', 'Fixa', 300),
        (dt.date(y, 3, 12), 'Anúncio', 'Marketing', 'Variável', 50),
        (dt.date(y - 1, 12, 5), 'Aluguel', 'Aluguel', 'Fixa', 300),
    ]
    for i, (a, b, cc, dd, e) in enumerate(desps):
        for j, val in enumerate((a, b, cc, dd, e)):
            d.cell(row=5 + i, column=j + 1, value=val)
    for i, dias in enumerate((10, 45, 75, 120)):
        c.cell(row=5 + i, column=1, value=f'C00{i+1}')
        c.cell(row=5 + i, column=5, value=hoje - dt.timedelta(days=dias))
    k['A5'], k['F5'], k['G5'], k['H5'], k['I5'] = 'Semana especial', 100, 20, 5, 400
    p['A5'], p['B5'], p['C5'], p['D5'], p['E5'], p['G5'] = 'Corte', 20, 5, 10, 30, 80
    pn['B5'] = dt.date(y, 1, 1); pn['B6'] = dt.date(y, 2, 28); pn['B7'] = 10

wb.active = 0
out = 'teste.xlsx' if TESTE else 'VENDAMAIS_IA_Planilha_de_Gestao.xlsx'
wb.save(out)
print('salvo', out)
