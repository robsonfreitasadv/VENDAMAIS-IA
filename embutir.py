"""Gera pagina/index.html e pagina/obrigado.html com as imagens embutidas (arquivo único).
Edite sempre os arquivos fonte-*.html e rode: python embutir.py
"""
import re, base64, pathlib
P = pathlib.Path(__file__).parent / 'pagina'
for nome in ('index', 'obrigado'):
    s = (P / f'fonte-{nome}.html').read_text(encoding='utf-8')
    def emb(m):
        dados = base64.b64encode((P / m.group(1)).read_bytes()).decode()
        return f'src="data:image/jpeg;base64,{dados}"'
    s = re.sub(r'src="(img/[^"]+\.jpg)"', emb, s)
    s = s.replace('<!-- ARQUIVO-FONTE: edite este arquivo e rode "python embutir.py" para gerar o index.html com as imagens embutidas. -->', '<!-- ARQUIVO GERADO por embutir.py a partir de fonte-index.html. Não edite aqui. -->')
    (P / f'{nome}.html').write_text(s, encoding='utf-8')
    print(nome, round(len(s.encode()) / 1024), 'KB')
