# VENDAMAIS IA — onde paramos (handoff)

Atualizado em 12/11/2026. Leia junto com `CLAUDE.md`, `oferta/OFERTA.md` e `oferta/FUNIL.md`.

## Pronto

| Entregável | Onde |
| --- | --- |
| Manual + 8 módulos em PDF (163 páginas) e kit completo | `pdf/` (fonte em `conteudo/`) |
| Planilha de Gestão v2, conferida no Excel | `planilha/VENDAMAIS_IA_Planilha_de_Gestao.xlsx` |
| Kit de Aplicação (20 modelos) e 40 Templates em Word, com capa | `word/` |
| Pacote de entrega para a plataforma | `python empacotar.py` → `entrega/` (não vai para o git; gere de novo) |
| Ficha da oferta e funil | `oferta/OFERTA.md`, `oferta/FUNIL.md` |
| Artes de venda (horizontal e feed) | `oferta/VENDAMAIS_IA_Arte_*.png` |
| Página de vendas e de obrigado (imagens embutidas) | `pagina/index.html`, `pagina/obrigado.html` (fonte: `pagina/fonte-*.html`) |
| 10 criativos de anúncio + copy e estrutura de campanha | `anuncios/out/`, `anuncios/ANUNCIOS.md` |
| Termos de uso e política de privacidade (rascunho, com dados da R F Comércio e Representação Ltda.) | `pagina/termos.html`, `pagina/privacidade.html` (ligados no rodapé) |
| Cadastro do produto na Kiwify (descrição, entrega, e-mail de acesso, o que não ativar) | `oferta/PRODUTO_KIWIFY.md` |

## Onde trabalhar (12/11/2026)

A partir de 12/11/2026 o projeto é trabalhado **só no Claude Code na nuvem** (claude.ai/code), com este repositório. O GitHub privado https://github.com/robsonfreitasadv/VENDAMAIS-IA (branch `main`) é a única fonte. Os PCs Windows e a cópia ZIP no Google Drive (11/11) ficam como backup antigo; não editar.

A sessão na nuvem é temporária: **tudo o que não estiver commitado e enviado (`git push`) se perde** quando ela é encerrada.

Preparar a sessão (se o ambiente não tiver script de configuração):

```
npm ci
uv venv -p 3.12 .venv && uv pip install -p .venv -r requirements.txt
```

- Python: use `.venv/bin/python` (ex.: `.venv/bin/python juntar.py`). O PyMuPDF 1.24.10 não instala no Python 3.13; por isso o ambiente virtual em 3.12.
- Chrome: `chrome.mjs` escolhe o navegador. No Linux usa o Chromium em `/opt/pw-browsers/chromium`; no Windows, o Chrome instalado. Outro caminho: variável `CHROME_PATH`.
- Testado na nuvem em 12/11: `node build.mjs manual kit-aplicacao templates-editaveis`, `juntar.py` e `gerar_word.py` rodaram; página do Manual comparada com a original: idêntica.
- Sem Excel/Word na nuvem: a conferência da planilha e dos .docx passa a ser no Google Sheets/Docs ou no celular.

Se um dia voltar a usar um PC Windows: `git clone`, `npm ci`, `py -m pip install -r requirements.txt`.

## Decisões do dono (não reverter)

- Público: negócios de beleza. Marca: "VENDAMAIS IA". Preço de teste: R$ 67.
- **Sem suporte.** Só garantia: cancelamento e reembolso em 7 dias pela plataforma.
- Rodapé da página: só "Vendamais IA", termos e privacidade (sem CNPJ, endereço, contato ou e-mail).
- Nada de escassez falsa, preço riscado, promessa de resultado ou depoimento inventado.

## Pendente / próximos passos

1. **CNAE da empresa (fiscal, antes da primeira venda):** a R F Comércio e Representação Ltda. (CNPJ 64.610.463/0001-58) tem CNAE de representação comercial e varejo de alimentos. Nenhum cobre venda de material educativo digital. Ver com o contador a inclusão do CNAE adequado, o enquadramento no Simples e a emissão de nota fiscal das vendas.
2. **E-mail de contato** para termos, privacidade e Kiwify: criar um Gmail próprio do VENDAMAIS IA para o teste (o do cartão CNPJ é de outro negócio); com domínio próprio, trocar por contato@dominio via Cloudflare Email Routing e substituir `[E-MAIL]` em `pagina/termos.html` e `pagina/privacidade.html`.
3. Consultar "VENDAMAIS IA" no INPI.
4. Criar o produto na Kiwify seguindo `oferta/PRODUTO_KIWIFY.md` e subir o pacote (`.venv/bin/python empacotar.py` → `entrega/`).
5. Colar o link do checkout em `CHECKOUT_URL` (`pagina/fonte-index.html`) e rodar `.venv/bin/python embutir.py`.
6. **Página no ar e conferida pelo dono (12/11/2026): https://vendamais-ia.pages.dev** (Cloudflare Pages, plano grátis, conta `e3f093d1d52e249920c64353209f167b`, projeto `vendamais-ia`). Atualizar: `.venv/bin/python embutir.py && .venv/bin/python publicar.py --enviar`. A chave do Cloudflare (só Pages: Edit) fica salva no ambiente `vendamais-ia`; nunca no repositório. A rede da nuvem não abre `pages.dev`: conferir no navegador. **Nunca publicar a raiz do repositório.** Domínio próprio (.com.br no CNPJ) só quando os anúncios validarem.
7. Pixel da Meta e evento de compra; ao instalar, adicionar aviso de cookies na página e tirar os trechos amarelos da política. Trocar `[URL]` nos anúncios.
8. Compra-teste completa (Pix) e teste de reembolso.
9. Testar a planilha no Google Sheets e no celular; testar os .docx no Google Docs.
10. Testar uma amostra de comandos no ChatGPT e no Gemini.

Termos e política: trechos ainda em aberto aparecem destacados em amarelo (classe `pend`). Remover o destaque ao preencher. São rascunho; revisão jurídica final pelo dono.
