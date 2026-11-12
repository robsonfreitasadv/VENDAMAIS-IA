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

1. Escolher a plataforma (recomendação: Kiwify; confirmar taxas na página oficial).
2. Criar o produto com garantia de 7 dias e subir o pacote (`python empacotar.py`).
3. Colar o link do checkout em `CHECKOUT_URL` (`pagina/fonte-index.html`) e rodar `python embutir.py`.
4. Domínio e hospedagem da página; termos de uso e política de privacidade (links estão `#`).
5. Pixel da Meta e evento de compra; trocar `[URL]` nos anúncios.
6. Compra-teste completa.
7. Testar a planilha no Google Sheets e no celular; testar os .docx no Google Docs.
8. Testar uma amostra de comandos no ChatGPT e no Gemini.
9. Consultar "VENDAMAIS IA" no INPI.
