"""Relatório rápido da campanha VENDAMAIS IA na Meta (só leitura).

    ~/.venvs/meta-ads/bin/python anuncios/acompanhar.py

Mostra, por anúncio: status/revisão, gasto, impressões, cliques no link, CTR,
custo por clique, checkouts iniciados e compras desde o início, e aplica a regra
de corte do ANUNCIOS.md (pausar quem gastar ~2 x R$ 57 sem venda). Não altera nada.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import subir_campanha as sc  # noqa: E402  (reaproveita token, API e IDs)

LIMITE_SEM_VENDA = 114.0   # 2 x R$ 57 (custo máximo por venda)


def acao(lista, tipo):
    for a in lista or []:
        if a.get("action_type") == tipo:
            return float(a.get("value", 0))
    return 0.0


def main():
    sc.TOKEN = sc.token()
    est = json.loads(sc.ESTADO.read_text(encoding="utf-8"))
    nomes = {v: k for k, v in est.items() if k.startswith("ad:")}

    conta = sc.api("GET", sc.CONTA, {"fields": "balance,spend_cap,amount_spent,funding_source_details"})
    print("Conta:", conta.get("funding_source_details", {}).get("display_string"),
          f"| gasto total R$ {int(conta['amount_spent'])/100:.2f} de limite R$ {int(conta['spend_cap'])/100:.2f}")

    status = {}
    for ad_id in nomes:
        r = sc.api("GET", ad_id, {"fields": "effective_status,ad_review_feedback"})
        status[ad_id] = (r.get("effective_status"), r.get("ad_review_feedback"))

    ins = sc.api("GET", f"{est['campaign']}/insights", {
        "level": "ad", "date_preset": "maximum", "limit": 50,
        "fields": "ad_id,spend,impressions,inline_link_clicks,inline_link_click_ctr,"
                  "cost_per_inline_link_click,actions",
    }).get("data", [])
    por_ad = {i["ad_id"]: i for i in ins}

    total = {"gasto": 0.0, "compras": 0.0, "checkout": 0.0, "cliques": 0}
    alertas = []
    print(f"\n{'anúncio':<10}{'status':<16}{'gasto':>8}{'impr':>7}{'cliq':>6}{'CTR%':>6}{'CPC':>7}{'chk':>5}{'venda':>6}")
    for ad_id, chave in sorted(nomes.items(), key=lambda x: x[1]):
        st, rev = status[ad_id]
        i = por_ad.get(ad_id, {})
        gasto = float(i.get("spend", 0))
        cliques = int(i.get("inline_link_clicks", 0))
        compras = acao(i.get("actions"), "offsite_conversion.fb_pixel_purchase") or acao(i.get("actions"), "purchase")
        chk = acao(i.get("actions"), "offsite_conversion.fb_pixel_initiate_checkout") or acao(i.get("actions"), "initiate_checkout")
        nome = chave[3:]
        print(f"{nome:<10}{st:<16}{gasto:>8.2f}{int(i.get('impressions', 0)):>7}{cliques:>6}"
              f"{float(i.get('inline_link_click_ctr', 0)):>6.2f}{float(i.get('cost_per_inline_link_click', 0)):>7.2f}"
              f"{int(chk):>5}{int(compras):>6}")
        total["gasto"] += gasto; total["compras"] += compras; total["checkout"] += chk; total["cliques"] += cliques
        if rev:
            alertas.append(f"{nome}: revisão da Meta -> {rev}")
        if st in ("DISAPPROVED", "WITH_ISSUES"):
            alertas.append(f"{nome}: status {st}")
        if compras == 0 and gasto >= LIMITE_SEM_VENDA:
            alertas.append(f"{nome}: gastou R$ {gasto:.2f} sem venda -> pela regra, PAUSAR (pedir ok ao dono)")
        elif compras and gasto / compras < 57:
            alertas.append(f"{nome}: custo por venda R$ {gasto/compras:.2f} (< R$ 57) -> candidato a escalar")

    cpv = f"R$ {total['gasto']/total['compras']:.2f}" if total["compras"] else "-"
    print(f"\nTOTAL: gasto R$ {total['gasto']:.2f} | cliques {total['cliques']} | checkouts {int(total['checkout'])} "
          f"| vendas {int(total['compras'])} | custo por venda {cpv}")
    print("\nAlertas:" if alertas else "\nAlertas: nenhum")
    for a in alertas:
        print(" -", a)


if __name__ == "__main__":
    main()
