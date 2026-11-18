# VENDAMAIS IA — Meta (Facebook/Instagram)

Registro do que foi configurado (a extensão Claude no Chrome não guarda histórico).

## Pixel (18/11/2026)

| Item | Valor |
|---|---|
| Pixel ID | `1880875006593624` |
| Conjunto de dados | VENDAMAIS IA |
| Portfólio empresarial | Robson Freitas advocacia |
| Contas de anúncios conectadas | Alpha 01 (conferido em 18/11/2026) |
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

1. Pixel ID cadastrado na Kiwify (informado pelo dono em 18/11/2026; confirmar no Gerenciador de Eventos após a compra-teste).
2. **Decisão do dono (18/11/2026): anunciar pela conta "Alpha 01", no portfólio "Robson Freitas advocacia".** Falta conectar o conjunto de dados VENDAMAIS IA a essa conta (permanente).
3. Conferir com a extensão Meta Pixel Helper: nada antes do aceite; PageView e ViewContent depois.
4. Página do Facebook "VENDAMAIS IA": roteiro em `oferta/FACEBOOK.md`.
