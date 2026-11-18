# VENDAMAIS IA — Meta (Facebook/Instagram)

Registro do que foi configurado (a extensão Claude no Chrome não guarda histórico).

## Pixel (18/11/2026)

| Item | Valor |
|---|---|
| Pixel ID | `1880875006593624` |
| Conjunto de dados | VENDAMAIS IA |
| Portfólio empresarial | Robson Freitas advocacia |
| Contas de anúncios conectadas | nenhuma (a "Alpha 01" foi oferecida e **não** foi conectada) |
| Página conectada | nenhuma |
| API de Conversões | não conectada (caixa pré-marcada foi desmarcada) |
| Configuração automática de eventos / correspondência avançada | não ativadas |
| Termos | "Termos das Ferramentas Comerciais da Meta" aceitos pelo dono ao criar o conjunto |
| Onde achar | Configurações da empresa → Conjuntos de dados e pixels (não aparece na visão de conta de anúncios até ser conectado) |

## No site

- `META_PIXEL_ID` em `pagina/fonte-index.html`. Pixel só carrega após "Aceitar" no aviso de cookies.
- Eventos: PageView e ViewContent (R$ 67) ao aceitar; InitiateCheckout nos 4 botões de compra.
- Purchase **não** é disparado no site: fica com a Kiwify (mesmo Pixel ID, disparo no Pix pago).

## Pendências

1. Cadastrar o Pixel ID na Kiwify (Produto → Pixels/Rastreamento), compra no Pix **pago**.
2. Decidir a conta de anúncios antes de anunciar. Conectar o conjunto de dados a uma conta é permanente.
3. Conferir com a extensão Meta Pixel Helper: nada antes do aceite; PageView e ViewContent depois.
4. Página do Facebook "VENDAMAIS IA": roteiro em `oferta/FACEBOOK.md`.
