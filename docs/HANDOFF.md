# VENDAMAIS IA — onde paramos (handoff)

Atualizado em 18/11/2026. Leia junto com `CLAUDE.md`, `oferta/OFERTA.md` e `oferta/FUNIL.md`.

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
| Termos de uso e política de privacidade (rascunho; vendedor: RS Freitas, pessoa física, CPF parcialmente oculto) | `pagina/termos.html`, `pagina/privacidade.html` (ligados no rodapé) |
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

- **Pixel da Meta LIGADO (18/11/2026), ID 1880875006593624 — detalhes em `oferta/META.md`.** Antes: aviso de cookies + Pixel carregado só após "Aceitar"; eventos PageView, ViewContent e InitiateCheckout (cliques nos botões de compra). Purchase fica com a Kiwify (mesmo Pixel ID cadastrado lá), nunca na página de obrigado. Para ligar: colar o ID em `META_PIXEL_ID` (`pagina/fonte-index.html`), `embutir.py` e `publicar.py --enviar`. Política de privacidade já atualizada (Meta, finalidade, transferência internacional, revogação).

- SEO/GEO no ar (17/11/2026). Meta tag do Google Search Console já está na página (17/11). Falta: concluir a verificação no Search Console e enviar `https://vendamais-ia.pages.dev/sitemap.xml`; no Bing Webmaster Tools (o ChatGPT busca pelo Bing), o caminho mais simples é importar do Search Console, sem nova meta tag.
- Posts orgânicos prontos em `anuncios/POSTS_ORGANICOS.md` (10 posts, 2 semanas).

1. **CNAE da empresa (fiscal, antes da primeira venda):** a R F Comércio e Representação Ltda. (CNPJ 64.610.463/0001-58) tem CNAE de representação comercial e varejo de alimentos. Nenhum cobre venda de material educativo digital. Ver com o contador a inclusão do CNAE adequado, o enquadramento no Simples e a emissão de nota fiscal das vendas.
2. ~~E-mail de contato~~ feito: vendamaisia.suporte@gmail.com nos termos, na política e na ficha da Kiwify. Com domínio próprio, trocar por contato@dominio via Cloudflare Email Routing.
3. Consultar "VENDAMAIS IA" no INPI.
4. ~~Criar o produto na Kiwify~~ feito (compra-teste aprovada em 18/11/2026). Referência:  `oferta/PRODUTO_KIWIFY.md` e subir o pacote (`.venv/bin/python empacotar.py` → `entrega/`).
5. ~~Link do checkout~~ feito: https://pay.kiwify.com.br/vU9vQ0a em `CHECKOUT_URL` (4 botões, repassa UTMs). **Venda pelo CPF do dono:** termos e política atualizados em 17/11/2026 (RS Freitas, CPF parcialmente oculto, Fortaleza/CE). Quando migrar para o CNPJ, trocar de volta.
6. **Página no ar e conferida pelo dono (12/11/2026): https://vendamais-ia.pages.dev** (Cloudflare Pages, plano grátis, conta `e3f093d1d52e249920c64353209f167b`, projeto `vendamais-ia`). Atualizar: `.venv/bin/python embutir.py && .venv/bin/python publicar.py --enviar`. A chave do Cloudflare (só Pages: Edit) fica salva no ambiente `vendamais-ia`; nunca no repositório. A rede da nuvem não abre `pages.dev`: conferir no navegador. **Nunca publicar a raiz do repositório.** Domínio próprio (.com.br no CNPJ) só quando os anúncios validarem.
7. Pixel da Meta: código, aviso de cookies e política prontos (ver acima); falta só o ID. ~~Trocar `[URL]` nos anúncios~~ feito em 18/11: links apontam para https://vendamais-ia.pages.dev/ com UTMs; `oferta/FUNIL.md` atualizado.
8. ~~Compra-teste~~ feita e ok em 18/11/2026 (dono). Falta só o teste de reembolso.
9. Testar a planilha no Google Sheets e no celular; testar os .docx no Google Docs.
10. Testar uma amostra de comandos no ChatGPT e no Gemini.
11. Instagram: plano da semana 23–29/11/2026 em `marketing/semana-2026-11-23.md` (Black Friday **sem desconto**, decisão do dono; e-mail de contato não vai em post/anúncio). Nenhum dos 10 posts de `anuncios/POSTS_ORGANICOS.md` foi publicado ainda (dono, 18/11/2026). Peças da semana em `marketing/semana-2026-11-23/` (gerar de novo: `node marketing/pecas_semana.mjs`). Vídeos dos anúncios agora com locução e trilha em `anuncios/out/videos_com_audio/` (ver `anuncios/ANUNCIOS.md`). Falta o dono gravar a tela do Reel de terça (24/11).
12. Instagram **@vendamais.ia.oficial** criado e ligado à Página do Facebook "Vendamais IA" em 18/11/2026 (@vendamais.ia e @vendamaisia são de outras empresas de IA/marketing: reforça a consulta ao INPI do item 3). A Meta criou o portfólio empresarial "vendamais.ia.oficial" (business_id 4230695333730580) com Página + Instagram. Bio do Instagram salva (versão curta de 144 caracteres); link da bio, foto e nome feitos pelo dono no app. Posts da semana **programados no Planner do Meta Business Suite** (Facebook + Instagram, sem turbinar): seg 23 12h carrossel, qua 25 12h carrossel, qui 26 12h imagem, sex 27 12h Reel S06 com locução, sáb 28 10h imagem. Terça (Reel gravado) e Stories ficam para o dono.
13. **Campanha de anúncios ATIVADA em 18/11/2026 (R$ 60/dia, aprovado pelo dono)** na conta **"Robson S Freitas" (act_598501181201373, com saldo)**; uma cópia igual ficou pausada na Alpha 01 (sem saldo, não usar): "VMIA | Vendas | Teste 1", conjuntos A (aberto) e B (interesses), R$ 30/dia cada, 10 anúncios. Detalhes em `anuncios/ANUNCIOS.md` (seção "Campanha criada na Meta"); script `anuncios/subir_campanha.py`, IDs em `anuncios/campanha_meta_<conta>.json`. Para isso: portfólio vendamais.ia.oficial deu ao portfólio Robson Freitas advocacia (parceiro) acesso de anúncios à Página e ao Instagram; usuário do sistema claude-ads recebeu Página, Instagram e o conjunto de dados; app "Claude Ads" passou a modo Live (política: privacidade.html). A conta "Robson S Freitas" foi adicionada ao portfólio Robson Freitas advocacia (permanente), liberada ao claude-ads e conectada ao Pixel. **Acompanhar:** regra de corte em `anuncios/ANUNCIOS.md` (pausar anúncio que gastar ~R$ 114 sem venda); saldo de R$ 129,99 cobre ~2 dias a R$ 60/dia e o limite de gastos da conta deixa ~R$ 114.

Termos e política: não há mais trechos em amarelo (classe `pend` só no CSS). Continuam rascunho; revisão jurídica final pelo dono.
