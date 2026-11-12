# VENDAMAIS IA — Cadastro do produto na Kiwify

> Texto pronto para colar ao criar o produto. Baseado em `oferta/OFERTA.md` (fonte da verdade).
> Os nomes dos campos variam na plataforma: use como guia, não como lista exata. Confirme taxas, prazos de saque e limites de arquivo na página oficial da Kiwify.

## 1. Dados básicos

| Campo | Valor |
|---|---|
| Nome do produto | VENDAMAIS IA — Kit de marketing e vendas para negócios de beleza |
| Tipo | Produto digital (arquivos para download / área de membros) |
| Categoria | Negócios / empreendedorismo (ou a mais próxima disponível) |
| Preço | R$ 67,00, pagamento único |
| Garantia | 7 dias |
| Formas de pagamento | Pix, cartão e boleto (atenção: no boleto o acesso só sai após a compensação) |
| Página de vendas | `https://[SEU-DOMINIO]/` (preencher quando houver domínio) |
| Página de obrigado | `https://[SEU-DOMINIO]/obrigado.html` |
| E-mail de contato exibido | O mesmo dos termos de uso (`[E-MAIL]`). Será exibido ao comprador pela plataforma |

## 2. Descrição curta (até ~200 caracteres)

Mais de 220 comandos prontos para ChatGPT e Gemini, planilha de gestão e plano de 30 dias para negócios de beleza organizarem marketing, atendimento e vendas.

## 3. Descrição completa

Você cuida da beleza das suas clientes. O VENDAMAIS IA ajuda você a cuidar do marketing e das vendas do seu negócio.

Kit digital para salões, barbearias, estética, manicures, designers de sobrancelhas e autônomos da beleza que fazem o próprio marketing no Instagram e no WhatsApp.

**O que você recebe (download imediato):**
- Manual de início rápido (PDF)
- 8 módulos em PDF com mais de 220 comandos prontos para ChatGPT e Gemini:
  01 Instagram e produção de conteúdo · 02 Atendimento e WhatsApp · 03 Vendas e conversão · 04 Fidelização e reativação de clientes · 05 Gestão e organização · 06 Campanhas prontas para vender (30 campanhas) · 07 Biblioteca de 40 templates editáveis · 08 Implementação em 30 dias
- Kit completo em um único PDF (163 páginas)
- Bônus 1: Planilha de Gestão (Excel) com painel automático, vendas, despesas, clientes, calendário editorial e simulador de preço
- Bônus 2: Kit de Aplicação (Word) com 20 modelos de mensagens para Instagram e WhatsApp, checklist, rotina semanal e plano de 7 dias

**Como funciona:** copie o comando, troque o que está entre colchetes pelas informações do seu negócio e cole no ChatGPT ou no Gemini, nas versões gratuitas. 15 a 30 minutos por dia.

**Garantia de 7 dias:** se não for para você, peça o reembolso integral pela plataforma.

Material educativo. Não há promessa de vendas, faturamento ou resultados. A IA pode errar: revise tudo antes de publicar. ChatGPT é marca da OpenAI e Gemini é marca do Google; o VENDAMAIS IA não tem vínculo com essas empresas. Não inclui suporte individual.

## 4. Entrega

Arquivos em `entrega/` (gerar com `.venv/bin/python empacotar.py`; a pasta não vai para o git):

- **Opção recomendada:** área de membros com um módulo por pasta do pacote (`1_Comece_aqui`, `2_Modulos_PDF`, `3_Arquivos_editaveis`, `4_Bonus`, `5_Tudo_em_um_arquivo`), cada arquivo como anexo, e o ZIP `VENDAMAIS_IA_v1.zip` (12,1 MB) como "baixar tudo". Funciona melhor no celular que só o ZIP.
- **Opção mínima:** só o ZIP como arquivo de entrega. No celular, parte das compradoras não sabe abrir ZIP.

## 5. E-mail de acesso (se a plataforma permitir personalizar)

**Assunto:** Seu VENDAMAIS IA chegou

Olá, {nome}!

Sua compra do VENDAMAIS IA foi confirmada. Acesse seus arquivos pelo botão abaixo.

Por onde começar:
1. Abra o "00 — Manual de início rápido" (15 minutos).
2. Preencha a ficha do seu negócio (Passo 2 do Manual).
3. Amanhã, siga o Dia 01 do Módulo 08.

Dica: salve os PDFs no celular para copiar os comandos a qualquer momento.

Garantia: você tem 7 dias para pedir o reembolso integral pela própria plataforma.

## 6. Configurações do checkout: o que NÃO ativar

- Order bump e upsell: **não** até o produto existir (regra do `FUNIL.md`).
- Cronômetro de contagem regressiva, "últimas vagas" ou preço "de/por": **não**. Escassez falsa e preço de referência fictício são prática enganosa (CDC, art. 37) e derrubam anúncios na Meta.
- Depoimentos no checkout: **não** até existirem depoimentos reais e autorizados.

## 7. Depois de criar o produto

1. Copiar o link do checkout para `CHECKOUT_URL` em `pagina/fonte-index.html` e rodar `.venv/bin/python embutir.py`.
2. Preencher o e-mail de contato e os demais trechos em amarelo nos termos e na política (`pagina/termos.html`, `pagina/privacidade.html`).
3. Compra-teste com Pix; em seguida, testar o pedido de reembolso.
