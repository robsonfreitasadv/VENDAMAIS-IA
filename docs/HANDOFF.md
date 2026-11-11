# VENDAMAIS IA — onde paramos (handoff)

Atualizado em 11/11/2026. Leia junto com `CLAUDE.md`, `oferta/OFERTA.md` e `oferta/FUNIL.md`.

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

## Cópia no Google Drive (11/11/2026)

O GitHub (`robsonfreitasadv/vendamais-ia`) ainda não recebeu o envio: o push respondeu "Repository not found" (provável credencial sem acesso ao repositório novo). Enquanto isso, o projeto está no Drive, pasta **VENDAMAIS IA**: https://drive.google.com/drive/folders/1AQiRhXeQ4FJS30Zq_1eZbkhwcsBSOM3J — 5 ZIPs (limite de 10 MB por envio) para extrair todos em `C:\Users\robson.freitas\`, mais `LEIA-ME_COMO_USAR_NO_NOTEBOOK.txt`. A cópia não leva a pasta `.git`.

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
