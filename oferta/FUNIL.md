# VENDAMAIS IA — Funil de vendas (v1)

> Base: ficha `oferta/OFERTA.md`. Pesquisa feita em 11/11/2026 (fontes no fim).
> Os números de referência abaixo são de blogs de plataformas e guias de mercado, não de estudos independentes. Use como ponto de partida e substitua pelos seus dados depois das primeiras 100 visitas pagas.

## 1. O modelo escolhido: funil low ticket direto

É o modelo mais usado hoje para produto digital barato com tráfego frio: anúncio → página de vendas longa, sem menu → checkout com order bump → upsell de 1 clique → página de obrigado → sequência pós-compra. O dinheiro do low ticket costuma vir do aumento de ticket no checkout e no pós-compra, não só do produto principal.

```
Anúncio (Reels/Stories, dor específica)
        │
        ▼
Página de vendas  ──(não comprou)──► Remarketing 7 dias (anúncio de prova: "veja por dentro")
        │
        ▼
Checkout (Hotmart/Kiwify)  ──(abandonou)──► Recuperação de carrinho: 1 h, 24 h, 72 h
   │  + order bump [FASE 2]
   ▼
Upsell 1 clique [FASE 3] ──(recusou)──► Downsell [FASE 3]
        │
        ▼
Página de obrigado → e-mail de acesso → sequência de 30 dias (acompanha o Módulo 08)
        │
        ▼
Dia 30: pedido de depoimento autorizado → vira prova social da página
```

### Por que não começar com quiz

Funis de quiz aparecem bem nos relatórios de 2026, mas os dados são de e-commerce (Shopify) e de fornecedores de ferramentas de quiz. Para infoproduto de R$ 67 não há referência confiável. **Decisão:** lançar com página direta e testar um quiz como variante B depois que a página tiver taxa de conversão medida.

## 2. Fases

| Fase | O que entra | Quando | Status |
|---|---|---|---|
| 1 — Lançamento | Página de vendas + checkout + obrigado + e-mails de acesso | Agora | Página no ar (https://vendamais-ia.pages.dev) com checkout da Kiwify; falta criar o produto na Kiwify e o e-mail de acesso |
| 2 — Order bump | Um item complementar no checkout, 20% a 40% do preço (R$ 17 a R$ 27) | Após as primeiras 30 vendas | **Produto ainda não existe.** Candidato: "Pack Datas da Beleza 2027" — legendas, Stories e mensagens de WhatsApp para 12 datas comemorativas, prontos para adaptar |
| 3 — Upsell / downsell | Oferta de maior valor logo após a compra | Quando houver produto e capacidade de entrega | **Não existe.** Candidatos: implementação guiada em grupo (upsell) e versão gravada (downsell). Só criar se você puder entregar |
| 4 — Quiz | Pré-página "Qual é o maior gargalo do seu negócio de beleza?" | Depois de medir a página | Ideia |

> Regra: **nenhum bump ou upsell entra no checkout antes de o produto existir de verdade.** A página atual vende só o kit.

## 3. Metas e contas (preencher com dados reais)

| Métrica | Referência para começar | Fonte / observação |
|---|---|---|
| Conversão da página (visita → compra), tráfego frio | 1% a 3% | Referência de mercado para low ticket; medir a sua |
| Aceite do order bump | 10% a 30% de aumento no ticket médio | Levantamento citado pela Hotmart (WPFunnels, Cartpanda) |
| Aceite do upsell pós-compra | 3% a 8% | Hotmart; abaixo de 3%, revisar oferta ou momento |
| Aprovação de cartão | ~85% | Guia de checkout HeroSpark |

**Custo máximo por venda (CPA de equilíbrio):**
`preço − taxa da plataforma − impostos = valor líquido por venda`.
Com R$ 67 e taxas e impostos somando em torno de 15% (confirme com a plataforma e o contador), o líquido fica perto de R$ 57. **Se o anúncio custar mais que isso por venda, o funil dá prejuízo** até o bump e o upsell existirem.

## 4. Anúncios (fase 1)

Formato: vídeo vertical de 15 a 30 segundos (Reels e Stories), mostrando a tela do celular com o comando sendo usado. Público: donas e profissionais de salão, barbearia, estética, manicure e sobrancelhas, de 25 a 55 anos.

Cada criativo ataca **uma** dor do briefing:

| # | Gancho (primeiros 3 segundos) | O que o vídeo mostra |
|---|---|---|
| 1 | "Cliente perguntou o preço e sumiu?" | Comando 17 do Módulo 02 gerando a resposta para "achei caro" |
| 2 | "Não sabe o que postar amanhã?" | Comando 05 do Módulo 01 montando a semana de posts |
| 3 | "Terça-feira vazia na agenda?" | Comando 22 do Módulo 01 / Campanha 24 do Módulo 06 |
| 4 | "Aquela cliente que não volta há 3 meses…" | Ferramenta 09 do Módulo 04 + aba Clientes da planilha |
| 5 | "Você sabe quanto sobrou no mês passado?" | Painel da planilha (dados ilustrativos) |

**Não usar nos anúncios:** promessa de faturamento ou de "agenda lotada", antes e depois de clientes sem autorização, depoimentos inventados, "últimas vagas" falsas e preço riscado ("de R$ 497 por R$ 67"). Preço de referência fictício é prática enganosa (CDC) e também derruba anúncios na Meta.

## 5. Mensagens pós-compra (e-mail; WhatsApp só com autorização)

Acompanham o Módulo 08. Configurar na plataforma ou na ferramenta de e-mail quando o domínio existir.

| Quando | Assunto | Conteúdo |
|---|---|---|
| Na compra | Seu VENDAMAIS IA chegou | Links de acesso e "comece pelo Manual (15 min)" |
| Dia 1 | Hoje: 20 minutos para o diagnóstico | Dia 01 do plano, comando pronto |
| Dia 3 | A resposta para "achei caro" | Comando 17 do Módulo 02 + exemplo antes e depois |
| Dia 7 | Primeiro checkpoint | Checklist da Semana 1 |
| Dia 14 | O que funcionou nos seus posts? | Comando de análise do Dia 14 |
| Dia 21 | Seus números da semana 3 | Planilha: aba Painel e conversão |
| Dia 30 | Como foi? (e um pedido) | Pesquisa curta + pedido de depoimento **com autorização expressa** para uso na página |

**Carrinho abandonado** (recurso da plataforma): 1 h, 24 h e 72 h. Tom de ajuda ("ficou alguma dúvida?"), sem urgência falsa. Mensagem de WhatsApp só para quem informou o número e consentiu.

## 6. Página de vendas — estrutura usada

Ordem de seções mais recomendada pelas fontes (título → problema → agitação → solução → prova → oferta → garantia → CTA), sem menu nem links de saída e com CTA repetido:

1. Topo: promessa + subtítulo + CTA + imagem real do kit + selos (download, garantia)
2. Dores ("você se reconhece?")
3. Virada: não é falta de talento, é falta de tempo e de método
4. Como funciona em 3 passos, com um comando real
5. Prova: antes e depois de respostas no WhatsApp (exemplos do Módulo 02)
6. O que você recebe: capas reais e números conferidos
7. Veja por dentro: páginas reais dos PDFs e da planilha
8. Plano de 30 dias
9. Para quem é / não é
10. Oferta + garantia
11. Perguntas frequentes
12. CTA final + rodapé legal

**Sem depoimentos por enquanto** (não existem). A prova vem de mostrar o produto por dentro. Depoimentos entram depois do Dia 30 das primeiras compradoras, com autorização.

## 7. Pendências do funil

- [x] Plataforma: Kiwify.
- [ ] Criar o produto com preço, garantia de 7 dias e entrega dos arquivos (`oferta/PRODUTO_KIWIFY.md`).
- [x] `CHECKOUT_URL` em `pagina/fonte-index.html`: https://pay.kiwify.com.br/vU9vQ0a (repassa UTMs).
- [x] Página publicada no Cloudflare Pages: https://vendamais-ia.pages.dev.
- [ ] Domínio próprio só quando os anúncios validarem.
- [x] Termos de uso e política de privacidade: `pagina/termos.html` e `pagina/privacidade.html` (e-mail de contato, vendedor pessoa física e Pixel da Meta já incluídos).
- [x] Rodapé: nome "Vendamais IA", sem CNPJ, endereço ou contato (decisão do dono, 11/11/2026). Os dados do vendedor ficam no checkout da plataforma e nos termos de uso (exigência do Decreto 7.962/2013).
- [ ] Pixel da Meta: código pronto e desligado na página; falta o ID (`META_PIXEL_ID`) e cadastrar o mesmo ID na Kiwify para o evento de compra.
- [ ] Gravar os 5 criativos.

## Fontes

- [Panda Video — Low ticket funnel](https://www.pandavideo.com/blog/low-ticket-funnel)
- [HeroSpark — Esteira de ofertas: upsell, order bump e downsell](https://herospark.com/guias/esteira-de-ofertas)
- [HeroSpark — Checkout de alta conversão](https://herospark.com/guias/checkout-que-converte)
- [Hotmart — Order bump e funil de vendas](https://hotmart.com/pt-br/blog/order-bump-hotmart-funil-de-vendas)
- [Hotmart — Order bump da Hotmart](https://hotmart.com/pt-br/blog/order-bump-da-hotmart)
- [Hotmart — O que é upsell](https://hotmart.com/pt-br/blog/o-que-e-upsell)
- [Hotmart — Testes A/B em página de vendas](https://hotmart.com/pt-br/blog/testes-a-b)
- [HeroSpark — Estrutura de página de vendas](https://herospark.com/blog/estrutura-pagina-de-vendas/)
- [ConvertFlow — Product quiz funnel benchmark, set/2026](https://www.convertflow.com/benchmark-reports/product-quiz-funnel-benchmark-september-2026)
- [Interact — Quiz conversion rate report 2026](https://tryinteract.com/blog/quiz-conversion-rate-report/)
- [RevenueHunt — State of product recommendation quizzes, jun/2026](https://revenuehunt.com/state-of-product-recommendation-quizzes/)
