# Preenche uma cópia da planilha com dados ILUSTRATIVOS só para a imagem de divulgação.
import datetime as dt, random, openpyxl
random.seed(7)
wb = openpyxl.load_workbook('planilha/VENDAMAIS_IA_Planilha_de_Gestao.xlsx')
v, d, c, k = wb['Vendas'], wb['Despesas'], wb['Clientes'], wb['Campanhas']
y = 2026; r = 5
servicos = [('Corte', 70), ('Escova', 55), ('Manicure', 40), ('Design de sobrancelhas', 45), ('Coloração', 180)]
canais = ['Instagram', 'WhatsApp', 'Indicação', 'Loja física']
for m in range(1, 11):
    for _ in range(15 + m // 3):
        nome, preco = random.choice(servicos)
        v.cell(r, 1, dt.date(y, m, random.randint(1, 27))); v.cell(r, 3, nome); v.cell(r, 4, random.choice(canais))
        v.cell(r, 5, 1); v.cell(r, 6, preco); v.cell(r, 9, 'Concluída'); r += 1
    if m % 3 == 0:
        v.cell(r, 1, dt.date(y, m, 15)); v.cell(r, 3, 'Escova'); v.cell(r, 5, 1); v.cell(r, 6, 55); v.cell(r, 9, 'Cancelada'); r += 1
r = 5
for m in range(1, 11):
    for desc, cat, tipo, val in [('Aluguel da cadeira', 'Aluguel', 'Fixa', 350), ('Internet', 'Internet', 'Fixa', 100),
                                 ('Produtos', 'Material/insumos', 'Variável', random.randint(180, 260)),
                                 ('Anúncios', 'Marketing', 'Variável', random.choice([0, 50, 80]))]:
        d.cell(r, 1, dt.date(y, m, 5)); d.cell(r, 2, desc); d.cell(r, 3, cat); d.cell(r, 4, tipo); d.cell(r, 5, val); r += 1
hoje = dt.date(2026, 11, 11)
for i in range(45):
    c.cell(5 + i, 1, f'C{i+1:03d}'); c.cell(5 + i, 5, hoje - dt.timedelta(days=random.choice([5, 12, 20, 28, 40, 55, 70, 85, 100, 130])))
k['A5'], k['F5'], k['G5'], k['H5'], k['I5'] = 'Semana especial', 80, 25, 7, 520
pn = wb['Painel']; pn['B5'] = dt.date(y, 10, 1); pn['B6'] = dt.date(y, 10, 31); pn['B7'] = 38
wb.save('oferta/assets/planilha_demo.xlsx'); print('ok')
