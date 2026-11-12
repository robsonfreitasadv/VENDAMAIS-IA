# VENDAMAIS IA — regras para o Claude Code

Kit digital para negócios de beleza: 8 módulos em PDF + Manual de início rápido + Planilha de Gestão (Excel) + Kit de Aplicação (Word), vendido por página própria e checkout em plataforma. Projeto independente; não tem relação com outros projetos desta máquina. Converse com o dono em português.

## Fonte da verdade

- **`oferta/OFERTA.md`** define tudo o que pode ser anunciado: números, bônus, preço, garantia e a lista do que **não** anunciar. Página, arte, anúncios e e-mails seguem essa ficha. Mudou um arquivo do kit? Atualize a ficha antes.
- **`oferta/FUNIL.md`**: funil, fases, anúncios, e-mails e pendências.

## Regras de conteúdo

- Nunca prometer vendas, faturamento ou resultado. Nada de depoimento inventado, escassez falsa ou preço riscado fictício.
- Nenhum order bump ou upsell no checkout antes de o produto existir.
- Imagens de divulgação só com material real do kit (capas, páginas, planilha). Dados da planilha nas imagens são ilustrativos e rotulados assim.
- Marca sempre "VENDAMAIS IA". Público: negócios de beleza. Linguagem neutra em gênero quando falar com a cliente.

## Rotina e ambiente (desktop e notebook)

- Repositório: GitHub privado https://github.com/robsonfreitasadv/VENDAMAIS-IA. Pasta local nos dois computadores: `C:\Users\robson.freitas\VENDAMAIS-IA`.
- **Início de sessão:** `git pull` e ler `docs/HANDOFF.md`.
- **Fim de cada conjunto de mudanças:** atualizar `docs/HANDOFF.md`, commit com mensagem clara e `git push`.
- Primeira vez num computador: `npm install` (Node 18+), `python -m pip install pymupdf==1.24.10 openpyxl==3.1.5 python-docx==1.1.2` e Google Chrome em `C:/Program Files/Google/Chrome/Application/chrome.exe` (gera PDFs, capas, artes e criativos). Excel e Word só para conferir planilha e .docx.
- `build/`, `entrega/` e `node_modules/` não vão para o git: são gerados.

## Estrutura e comandos

| Pasta / arquivo | O quê | Como gerar |
| --- | --- | --- |
| `conteudo/*.md`, `modulos.json`, `estilo.css` | Fonte dos PDFs (blocos ```` ```prompt ```` e ```` ```modelo ```` viram quadros) | `node build.mjs` e `python juntar.py` → `pdf/` |
| `conteudo/kit-aplicacao.md`, `conteudo/modulo-07.md` + `gerar_word.py` | Entregáveis em Word (Kit de Aplicação e 40 Templates), com capa no molde da página | `node build.mjs kit-aplicacao templates-editaveis` (capas) e `python gerar_word.py` → `word/` |
| `empacotar.py`, `entrega_modelo/LEIA-ME.txt` | Pacote de entrega para a plataforma (pasta organizada + ZIP) | `python empacotar.py` → `entrega/VENDAMAIS_IA/` e `entrega/VENDAMAIS_IA_v1.zip` |
| `anuncios/criativos.mjs`, `anuncios/ANUNCIOS.md` | 10 criativos para Meta (6 estáticos em 4:5 e 9:16, 4 carrosséis 1:1) e a copy de cada um | `node anuncios/criativos.mjs` → `anuncios/out/` |
| `planilha/ajustar.py` | Gera a Planilha v2 a partir de `planilha/original.xlsx` | `cd planilha && python ajustar.py` (`--teste` cria cópia com dados fictícios) |
| `oferta/arte.mjs` | Artes de venda (horizontal e feed) | `node oferta/arte.mjs` |
| `oferta/demo_planilha.py` | Planilha com dados ilustrativos para imagens | `python oferta/demo_planilha.py` |
| `pagina/fonte-*.html` | Fonte da página de vendas e da de obrigado | `python embutir.py` → `pagina/index.html` e `obrigado.html` com imagens embutidas (manter abaixo de ~500 KB) |

- **Não há suporte.** Não mencionar suporte em nenhum material. Só a garantia: cancelamento e reembolso em 7 dias, feitos pela plataforma de compra.
- Rodapé da página de vendas: só "Vendamais IA", termos e privacidade. Sem CNPJ, endereço, contato ou e-mail (decisão do dono).
- Link do checkout: `CHECKOUT_URL` em `pagina/fonte-index.html`.
- Prévia local da página: servidor `pagina-vendas` em `.claude/launch.json` (porta 8090).
- Excel 2013 está instalado: use-o via COM para recalcular e conferir a planilha.
