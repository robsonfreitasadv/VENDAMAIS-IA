"""Sobe a campanha de teste do VENDAMAIS IA na Meta, tudo PAUSADO.

Roda no WSL (a CLI/credenciais da Meta ficam lá):
    ~/.venvs/meta-ads/bin/python anuncios/subir_campanha.py --dry   # só mostra os textos lidos
    ~/.venvs/meta-ads/bin/python anuncios/subir_campanha.py         # cria o que faltar

Lê o token de ~/.config/meta-ads/.env (nunca do repositório). Textos, títulos,
botões e utm_content vêm de anuncios/ANUNCIOS.md. Os IDs criados ficam em
anuncios/campanha_meta.json, e uma nova execução só cria o que ainda não existe.
Nada é ativado aqui: ativar (gastar) é decisão do dono, no Gerenciador.
"""
import json
import re
import sys
import time
from pathlib import Path

import requests

AQUI = Path(__file__).resolve().parent
OUT = AQUI / "out"
ESTADO = AQUI / "campanha_meta.json"
API = "https://graph.facebook.com/v23.0/"

CONTA = "act_321579250409258"          # Alpha 01
PAGINA = "1451545498044026"            # Página Vendamais IA
INSTAGRAM = "17841462612974667"        # @vendamais.ia.oficial (ig_user_id)
PIXEL = "1880875006593624"             # conjunto de dados VENDAMAIS IA
SITE = "https://vendamais-ia.pages.dev/"
DOMINIO = "vendamais-ia.pages.dev"
UTM = "utm_source=meta&utm_medium=paid_social&utm_campaign=vmia_lancamento&utm_content={}"
BOTAO = {"Comprar agora": "SHOP_NOW", "Saiba mais": "LEARN_MORE"}

CAMPANHA = "VMIA | Vendas | Teste 1"
CONJUNTOS = {
    "A": {
        "nome": "A | Aberto (Advantage+) | R$30",
        "orcamento": 3000,  # centavos de BRL
        "anuncios": ["S01", "S02", "S03", "S04", "C02"],
        "targeting": {
            "geo_locations": {"countries": ["BR"]},
            "age_min": 22,
            "locales": [16],
            "targeting_automation": {"advantage_audience": 1},
        },
    },
    "B": {
        "nome": "B | Interesses beleza + negócio | R$30",
        "orcamento": 3000,
        "anuncios": ["S01", "S05", "C01", "C03", "C04"],
        "targeting": {
            "geo_locations": {"countries": ["BR"]},
            "age_min": 22,
            "age_max": 55,
            "locales": [16],
            "flexible_spec": [
                {"interests": [
                    {"id": "6003088846792", "name": "Salões de beleza (cosméticos)"},
                    {"id": "6003988602106", "name": "Manicure (cosméticos)"},
                    {"id": "6877565512928", "name": "Notícias, conteúdo e tutoriais de beleza (cosméticos)"},
                    {"id": "6003423248519", "name": "Cuidados com o cabelo (cuidados pessoais)"},
                    {"id": "6811343488093", "name": "Mídia de cosmetologia (cosméticos)"},
                ]},
                {"interests": [
                    {"id": "6003371567474", "name": "Empreendedorismo (negócios e finanças)"},
                    {"id": "6003136069408", "name": "Pequenas e médias empresas (negócios e finanças)"},
                ]},
            ],
            "targeting_automation": {"advantage_audience": 0},
        },
    },
}

TOKEN = None


def token():
    env = Path.home() / ".config/meta-ads/.env"
    for linha in env.read_text().splitlines():
        if linha.startswith("ACCESS_TOKEN="):
            return linha.split("=", 1)[1].strip().strip("'\"").strip()
    sys.exit("ACCESS_TOKEN não encontrado em ~/.config/meta-ads/.env")


def api(metodo, caminho, dados=None, arquivos=None):
    dados = dict(dados or {})
    for k, v in list(dados.items()):
        if isinstance(v, (dict, list, bool)):
            dados[k] = json.dumps(v, ensure_ascii=False)
    dados["access_token"] = TOKEN
    if metodo == "GET":
        r = requests.get(API + caminho, params=dados, timeout=120)
    else:
        r = requests.post(API + caminho, data=dados, files=arquivos, timeout=600)
    corpo = r.json()
    if "error" in corpo:
        e = corpo["error"]
        raise RuntimeError(f"{caminho}: {e.get('message')} | {e.get('error_user_title', '')} "
                           f"{e.get('error_user_msg', '')}")
    return corpo


# ---------- textos a partir do ANUNCIOS.md ----------

def ler_anuncios():
    md = (AQUI / "ANUNCIOS.md").read_text(encoding="utf-8")
    anuncios = {}
    for s in re.split(r"^### ", md, flags=re.M)[1:]:
        m = re.match(r"([SC]0\d)\b", s)
        if not m:
            continue
        cod = m.group(1)
        corpo = [ln[4:] if ln.startswith("  > ") else "" for ln in s.splitlines() if ln.startswith("  >")]

        def campo(nome):
            mm = re.search(r"\*\*" + nome + r":\*\* (.+?)(?: · |$)", s, flags=re.M)
            return mm.group(1).strip() if mm else None

        botao = re.search(r"\*\*Botão:\*\* (.+?) ·", s).group(1).strip()
        utm = re.search(r"utm_content:\*\* `(\w+)`", s).group(1)
        cartoes = []
        if "**Títulos por card" in s:
            cartoes = re.findall(r'\d "([^"]+)"', s.split("**Títulos por card", 1)[1].splitlines()[0])
        anuncios[cod] = {
            "texto": "\n".join(corpo).strip(),
            "titulo": campo("Título"),
            "descricao": campo("Descrição"),
            "botao": BOTAO[botao],
            "utm": utm,
            "cartoes": cartoes,
        }
    return anuncios


# ---------- envio ----------

def carregar_estado():
    return json.loads(ESTADO.read_text(encoding="utf-8")) if ESTADO.exists() else {}


def salvar_estado(est):
    ESTADO.write_text(json.dumps(est, ensure_ascii=False, indent=2), encoding="utf-8")


def subir_imagem(est, caminho):
    chave = "img:" + caminho.name
    if chave not in est:
        with open(caminho, "rb") as f:
            r = api("POST", f"{CONTA}/adimages", arquivos={"filename": (caminho.name, f, "image/png")})
        est[chave] = next(iter(r["images"].values()))["hash"]
        salvar_estado(est)
        print("imagem", caminho.name, est[chave])
    return est[chave]


def subir_video(est, caminho):
    chave = "vid:" + caminho.name
    if chave not in est:
        with open(caminho, "rb") as f:
            r = api("POST", f"{CONTA}/advideos", {"name": caminho.stem},
                    arquivos={"source": (caminho.name, f, "video/mp4")})
        est[chave] = r["id"]
        salvar_estado(est)
        print("vídeo", caminho.name, est[chave])
    return est[chave]


def esperar_video(vid):
    for _ in range(60):
        st = api("GET", vid, {"fields": "status"})["status"]["video_status"]
        if st == "ready":
            return
        if st == "error":
            raise RuntimeError(f"vídeo {vid} com erro no processamento")
        time.sleep(10)
    raise RuntimeError(f"vídeo {vid} não ficou pronto")


def identidade():
    return {"page_id": PAGINA, "instagram_user_id": INSTAGRAM}


def criativo_estatico(est, cod, a):
    feed = subir_imagem(est, OUT / f"{cod}_feed_1080x1350.png")
    vert = subir_imagem(est, OUT / f"{cod}_stories_1080x1920.png")
    video = subir_video(est, OUT / "videos_com_audio" / f"{cod}_reels_1080x1920_audio.mp4")
    esperar_video(video)
    return {
        "object_story_spec": identidade(),
        "asset_feed_spec": {
            "images": [{"hash": feed, "adlabels": [{"name": f"{cod}_feed"}]}],
            "videos": [{"video_id": video, "thumbnail_hash": vert,
                        "adlabels": [{"name": f"{cod}_vertical"}]}],
            "bodies": [{"text": a["texto"]}],
            "titles": [{"text": a["titulo"]}],
            "descriptions": [{"text": a["descricao"]}],
            "link_urls": [{"website_url": SITE, "display_url": DOMINIO}],
            "call_to_action_types": [a["botao"]],
            "ad_formats": ["AUTOMATIC_FORMAT"],
            "optimization_type": "PLACEMENT",
            "asset_customization_rules": [
                {"customization_spec": {
                    "publisher_platforms": ["facebook", "instagram"],
                    "facebook_positions": ["story", "facebook_reels"],
                    "instagram_positions": ["story", "reels"]},
                 "video_label": {"name": f"{cod}_vertical"}, "priority": 1},
                {"customization_spec": {"age_min": 13, "age_max": 65},
                 "image_label": {"name": f"{cod}_feed"}, "priority": 2},
            ],
        },
        "url_tags": UTM.format(a["utm"]),
    }


def criativo_carrossel(est, cod, a):
    arquivos = sorted(OUT.glob(f"{cod}_card*_1080x1080.png"))
    if len(arquivos) != len(a["cartoes"]):
        raise RuntimeError(f"{cod}: {len(a['cartoes'])} títulos e {len(arquivos)} imagens")
    filhos = []
    for i, titulo in enumerate(a["cartoes"], 1):
        h = subir_imagem(est, OUT / f"{cod}_card{i}_1080x1080.png")
        filhos.append({"link": SITE, "image_hash": h, "name": titulo,
                       "call_to_action": {"type": a["botao"], "value": {"link": SITE}}})
    spec = identidade()
    spec["link_data"] = {
        "link": SITE,
        "message": a["texto"],
        "child_attachments": filhos,
        "multi_share_optimized": False,   # mantém a ordem dos cartões
        "multi_share_end_card": False,
        "caption": DOMINIO,
        "call_to_action": {"type": a["botao"], "value": {"link": SITE}},
    }
    return {"object_story_spec": spec, "url_tags": UTM.format(a["utm"])}


def criar_criativo(est, cod, a):
    chave = "creative:" + cod
    if chave not in est:
        corpo = criativo_carrossel(est, cod, a) if cod.startswith("C") else criativo_estatico(est, cod, a)
        corpo["name"] = f"VMIA {cod}"
        r = api("POST", f"{CONTA}/adcreatives", corpo)
        est[chave] = r["id"]
        salvar_estado(est)
        print("criativo", cod, r["id"])
    return est[chave]


def main():
    global TOKEN
    anuncios = ler_anuncios()
    usados = sorted({c for cj in CONJUNTOS.values() for c in cj["anuncios"]})
    faltando = [c for c in usados if c not in anuncios]
    if faltando:
        sys.exit(f"Sem texto no ANUNCIOS.md: {faltando}")
    if "--dry" in sys.argv:
        for c in usados:
            print(f"--- {c}", json.dumps(anuncios[c], ensure_ascii=False, indent=1))
        return
    TOKEN = token()
    est = carregar_estado()

    if "campaign" not in est:
        r = api("POST", f"{CONTA}/campaigns", {
            "name": CAMPANHA, "objective": "OUTCOME_SALES", "status": "PAUSED",
            "special_ad_categories": [], "buying_type": "AUCTION",
            "is_adset_budget_sharing_enabled": False,
        })
        est["campaign"] = r["id"]
        salvar_estado(est)
        print("campanha", r["id"])

    for letra, cj in CONJUNTOS.items():
        chave = "adset:" + letra
        if chave not in est:
            r = api("POST", f"{CONTA}/adsets", {
                "name": cj["nome"], "campaign_id": est["campaign"], "status": "PAUSED",
                "daily_budget": cj["orcamento"], "billing_event": "IMPRESSIONS",
                "optimization_goal": "OFFSITE_CONVERSIONS",
                "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
                "promoted_object": {"pixel_id": PIXEL, "custom_event_type": "PURCHASE"},
                "targeting": cj["targeting"],
            })
            est[chave] = r["id"]
            salvar_estado(est)
            print("conjunto", letra, r["id"])

    for letra, cj in CONJUNTOS.items():
        for cod in cj["anuncios"]:
            chave = f"ad:{letra}:{cod}"
            if chave in est:
                continue
            cr = criar_criativo(est, cod, anuncios[cod])
            r = api("POST", f"{CONTA}/ads", {
                "name": f"{letra} | {cod}", "adset_id": est["adset:" + letra],
                "creative": {"creative_id": cr}, "status": "PAUSED",
                "conversion_domain": DOMINIO,
            })
            est[chave] = r["id"]
            salvar_estado(est)
            print("anúncio", letra, cod, r["id"])
    print("Pronto: tudo PAUSADO.")


if __name__ == "__main__":
    main()
