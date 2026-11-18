"""Locução (2 vozes) + trilha suave nos Reels S01–S06 do VENDAMAIS IA.

Uso (na raiz do repositório):
    python anuncios/audio/montar_audio.py            # todos
    python anuncios/audio/montar_audio.py S01 S04    # só alguns

Requisitos: pip install edge-tts imageio-ffmpeg  (o edge-tts precisa de internet).

Gera:
    anuncios/audio/trilha_suave_12s.m4a                         trilha original (código, sem direitos de terceiros)
    anuncios/out/videos_com_audio/S0x_reels_1080x1920_audio.mp4 vídeo original (sem reencodar) + áudio
    anuncios/audio/FALAS.md                                     tabela das falas com a duração medida

Os vídeos originais em anuncios/out/videos/ não são alterados.
"""
import asyncio
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import edge_tts
import imageio_ffmpeg

# ---------------------------------------------------------------------------
# FALAS — a voz feminina (dona do negócio de beleza) abre com o gancho do
# criativo; a masculina responde, apresenta o kit e fecha com o botão do anúncio.
# Regras (oferta/OFERTA.md): sem promessa de vendas/faturamento/resultado, sem
# suporte, e-mail, escassez, contagem regressiva ou preço riscado; linguagem
# neutra em gênero ao falar com a cliente; preço só no S06 (é o que a tela mostra).
# Marca: o dono quer "Vendamais í-á" (Vendamais numa palavra + letras I e A).
# Escrita "Vendamais I-A": testado com os tempos do edge-tts, "IA" sem hífen é
# lido por extenso ("inteligência artificial", ~1,3 s); "I-A" sai em ~0,34 s.
# Pausa depois da marca (pedido do dono): o "Toque em ..." é sempre um trecho
# separado, então entra com a PAUSA entre trechos em vez de sair colado.
# Tom animado (pedido do dono): velocidade +10% a +12%, tom levemente mais agudo
# (TOM), frases curtas, sem reticências (que criam pausa arrastada).
# Cada ponto final custa ~0,8 s de pausa no TTS: prefira vírgula e dois-pontos.
# Números por extenso ("sessenta e cinco") saem mais rápidos que "65".
# ---------------------------------------------------------------------------
F = "pt-BR-FranciscaNeural"
M = "pt-BR-AntonioNeural"
TOM = {F: "+4Hz", M: "+3Hz"}
MARCA = "Vendamais I-A"

FALAS = {
    # S01 "Ela sumiu" · botão Comprar agora
    "S01": [
        (F, "Ela perguntou o preço, eu respondi, e ela sumiu!", "+10%"),
        (M, f"O problema foi a resposta! O {MARCA} tem sessenta e cinco respostas prontas.", "+12%"),
        (M, "Toque em Comprar agora!", "+10%"),
    ],
    # S02 "Achei caro" · botão Saiba mais
    "S02": [
        (F, "A cliente disse: achei caro! E agora, o que eu respondo?", "+10%"),
        (M, f"Responda sem dar desconto, com os comandos do {MARCA}.", "+10%"),
        (M, "Toque em Saiba mais!", "+10%"),
    ],
    # S03 "O que postar amanhã" · botão Comprar agora
    "S03": [
        (F, "Domingo à noite, e eu sem saber o que postar amanhã!", "+10%"),
        (M, f"Um comando pronto e a semana inteira planejada, com o {MARCA}.", "+10%"),
        (M, "Toque em Comprar agora!", "+10%"),
    ],
    # S04 "Terça vazia" · botão Comprar agora
    "S04": [
        (F, "Sábado lotado, e a terça-feira vazia de novo!", "+10%"),
        (M, f"O {MARCA} traz trinta campanhas prontas para os dias fracos.", "+10%"),
        (M, "Toque em Comprar agora!", "+10%"),
    ],
    # S05 "Cliente sumida" · botão Saiba mais
    "S05": [
        (F, "Aquela cliente que não volta há três meses!", "+10%"),
        (M, f"Dá para chamar de volta sem parecer insistente, com as mensagens prontas do {MARCA}.", "+12%"),
        (M, "Toque em Saiba mais!", "+10%"),
    ],
    # S06 Oferta direta (R$ 67 na tela) · botão Comprar agora
    "S06": [
        (F, "Dá para cuidar do marketing do meu negócio sem agência?", "+10%"),
        (M, f"Dá, sim! O {MARCA} tem oito módulos e planilha, por sessenta e sete reais.", "+12%"),
        (M, "Toque em Comprar agora!", "+10%"),
    ],
}

INICIO = 0.40        # s até a primeira fala
PAUSA = 0.35         # s entre trechos (inclui a pausa depois da marca, antes do "Toque em")
MAX_FALA = 10.5      # soma máxima das falas (s)
FIM_MAX = 11.5       # a última fala precisa terminar antes disto (s)
DURACAO = 12.0       # duração dos vídeos (s)
LUFS_VOZ = -14.0     # loudness final (a voz domina)
MUSICA_ABAIXO = 22   # dB da trilha abaixo da voz

RAIZ = Path(__file__).resolve().parents[2]
VIDEOS = RAIZ / "anuncios" / "out" / "videos"
SAIDA = RAIZ / "anuncios" / "out" / "videos_com_audio"
AUDIO = RAIZ / "anuncios" / "audio"
TRILHA = AUDIO / "trilha_suave_12s.m4a"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def ff(*args, capture=False):
    """Roda o ffmpeg; devolve o stderr (onde ele escreve Duration, loudnorm e ebur128)."""
    r = subprocess.run([FFMPEG, "-hide_banner", "-y", *map(str, args)],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.exit(f"ffmpeg falhou:\n{r.stderr[-3000:]}")
    return r.stderr


def duracao(arq):
    err = subprocess.run([FFMPEG, "-hide_banner", "-i", str(arq)], capture_output=True,
                         text=True, encoding="utf-8", errors="replace").stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def loudnorm_json(stderr):
    return json.loads(stderr[stderr.rindex("{"):stderr.rindex("}") + 1])


# --------------------------------------------------------------------------- trilha
# Pad Cmaj7 → Am7 → Fmaj7 → G (3 s cada). Cada nota = 2 senoides levemente
# desafinadas (chorus) + harmônico fraco. Janelas de acorde com bordas em
# cosseno que se sobrepõem 1 s: as trocas são cruzadas, sem estalo.
ACORDES = [
    [130.81, 164.81, 196.00, 246.94, 329.63],   # Cmaj7  C3 E3 G3 B3 E4
    [110.00, 164.81, 196.00, 261.63, 329.63],   # Am7    A2 E3 G3 C4 E4
    [87.31, 174.61, 220.00, 261.63, 329.63],    # Fmaj7  F2 F3 A3 C4 E4
    [98.00, 196.00, 246.94, 293.66, 392.00],    # G      G2 G3 B3 D4 G4
]


def expr_trilha():
    partes = []
    for k, notas in enumerate(ACORDES):
        s, e = 3.0 * k, 3.0 * (k + 1)
        sobe = f"(0.5-0.5*cos(PI*clip((t-{s - 0.3:.2f})/1.0,0,1)))" if k else "1"
        desce = f"(0.5-0.5*cos(PI*clip(({e + 0.7:.2f}-t)/1.0,0,1)))" if k < 3 else "1"
        tons = "+".join(
            f"0.5*sin(2*PI*{f}*t)+0.5*sin(2*PI*{f * 1.004:.3f}*t+1.3)+0.12*sin(4*PI*{f}*t)"
            for f in notas)
        partes.append(f"{sobe}*{desce}*({tons})")
    return f"0.035*({'+'.join(partes)})"


def gerar_trilha(tmp):
    bruto = tmp / "trilha_bruta.wav"
    cadeia = ("lowpass=f=1400,lowpass=f=2200,"
              "aecho=0.8:0.55:180|340:0.30|0.18,"
              "tremolo=f=0.25:d=0.15,"
              f"afade=t=in:st=0:d=0.5,afade=t=out:st={DURACAO - 1}:d=1")
    ff("-f", "lavfi", "-i", f"aevalsrc='{expr_trilha()}':s=48000:d={DURACAO}:c=stereo",
       "-af", cadeia, "-ar", 48000, bruto)
    # normaliza a -20 LUFS (nível de trabalho) em duas passadas
    m = loudnorm_json(ff("-i", bruto, "-af", "loudnorm=I=-20:TP=-2:LRA=11:print_format=json",
                         "-f", "null", "-"))
    norm = (f"loudnorm=I=-20:TP=-2:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
            f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:"
            f"offset={m['target_offset']}:linear=true")
    wav = tmp / "trilha.wav"
    ff("-i", bruto, "-af", norm, "-ar", 48000, "-t", DURACAO, wav)
    AUDIO.mkdir(parents=True, exist_ok=True)
    ff("-i", wav, "-c:a", "aac", "-b:a", "160k", "-ar", 48000, "-ac", 2, TRILHA)
    return wav


# --------------------------------------------------------------------------- vozes
async def tts(texto, voz, rate, mp3):
    await edge_tts.Communicate(texto, voz, rate=rate, pitch=TOM.get(voz, "+0Hz")).save(str(mp3))


def gerar_fala(texto, voz, rate, base):
    mp3 = base.with_suffix(".mp3")
    asyncio.run(tts(texto, voz, rate, mp3))
    wav = base.with_suffix(".wav")
    # corta o silêncio do começo e do fim para medir a fala de verdade
    corte = ("silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
             "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
             "afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse")
    ff("-i", mp3, "-af", corte, "-ar", 48000, "-ac", 1, wav)
    return wav, duracao(wav)


def montar(cod, tmp, trilha_wav):
    falas = []
    for i, (voz, texto, rate) in enumerate(FALAS[cod]):
        wav, d = gerar_fala(texto, voz, rate, tmp / f"{cod}_{i}")
        falas.append((voz, texto, rate, wav, d))
    total = sum(f[4] for f in falas)
    fim = INICIO + total + PAUSA * (len(falas) - 1)
    if total > MAX_FALA or fim > FIM_MAX:
        sys.exit(f"{cod}: fala longa demais ({total:.2f} s, termina em {fim:.2f} s). Encurte o texto.")

    # 1) faixa de voz posicionada na linha do tempo + compressão leve
    entradas, filtros, t = [], [], INICIO
    for i, f in enumerate(falas):
        entradas += ["-i", f[3]]
        filtros.append(f"[{i}:a]adelay={int(t * 1000)}|{int(t * 1000)}[v{i}]")
        t += f[4] + PAUSA
    rot = "".join(f"[v{i}]" for i in range(len(falas)))
    filtros.append(f"{rot}amix=inputs={len(falas)}:normalize=0,apad,atrim=0:{DURACAO},"
                   "highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2[voz]")
    voz_bruta = tmp / f"{cod}_voz_bruta.wav"
    ff(*entradas, "-filter_complex", ";".join(filtros), "-map", "[voz]", "-ar", 48000, "-ac", 2, voz_bruta)

    # 2) loudnorm em duas passadas na voz (alvo LUFS_VOZ)
    m = loudnorm_json(ff("-i", voz_bruta, "-af",
                         f"loudnorm=I={LUFS_VOZ}:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"))
    norm = (f"loudnorm=I={LUFS_VOZ}:TP=-1.5:LRA=11:measured_I={m['input_i']}:"
            f"measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
            f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")

    # 3) mistura: voz normalizada + trilha (-20 LUFS) abaixada para ficar ~22 dB sob a voz
    ganho_musica = (LUFS_VOZ - MUSICA_ABAIXO) - (-20.0)
    video = VIDEOS / f"{cod}_reels_1080x1920.mp4"
    SAIDA.mkdir(parents=True, exist_ok=True)
    out = SAIDA / f"{cod}_reels_1080x1920_audio.mp4"
    mix = (f"[1:a]{norm},aresample=48000[v];"
           f"[2:a]volume={ganho_musica}dB[mu];"
           f"[v][mu]amix=inputs=2:normalize=0:duration=first,"
           f"alimiter=limit=0.84:level=false,atrim=0:{DURACAO}[a]")
    ff("-i", video, "-i", voz_bruta, "-i", trilha_wav, "-filter_complex", mix,
       "-map", "0:v:0", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
       "-ar", 48000, "-ac", 2, "-t", DURACAO, "-movflags", "+faststart", out)
    return falas, fim, out


# --------------------------------------------------------------------------- conferência
def conferir(out):
    err = subprocess.run([FFMPEG, "-hide_banner", "-i", str(out)], capture_output=True,
                         text=True, encoding="utf-8", errors="replace").stderr
    nv = len(re.findall(r"Stream #\S+.*: Video:", err))
    na = len(re.findall(r"Stream #\S+.*: Audio:", err))
    e = ff("-nostats", "-i", out, "-map", "0:a", "-af", "ebur128=peak=true", "-f", "null", "-")
    resumo = e[e.rindex("Summary:"):]
    lufs = float(re.search(r"I:\s+(-?[\d.]+) LUFS", resumo).group(1))
    pico = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", resumo).group(1))
    return nv, na, duracao(out), lufs, pico


def escrever_falas_md(linhas):
    nome = {F: "Feminina (Francisca)", M: "Masculina (Antonio)"}
    md = ["# Falas da locução dos Reels S01–S06", "",
          "Gerado por `python anuncios/audio/montar_audio.py` (edite as falas no dicionário `FALAS` do script).",
          "Vozes neurais Microsoft via edge-tts. Trilha: `anuncios/audio/trilha_suave_12s.m4a` (gerada por código).",
          "A marca é escrita \"Venda Mais I.A.\" no texto do TTS para ser pronunciada \"Venda Mais i-á\".", "",
          "| Vídeo | Voz | Texto | Duração |", "| --- | --- | --- | --- |"]
    for cod, voz, texto, d in linhas:
        md.append(f"| {cod} | {nome[voz]} | {texto} | {d:.2f} s |")
    md += ["", "Saída: `anuncios/out/videos_com_audio/S0x_reels_1080x1920_audio.mp4`. "
           "O Reel de sexta é o S06: `anuncios/out/videos_com_audio/S06_reels_1080x1920_audio.mp4`.", ""]
    (AUDIO / "FALAS.md").write_text("\n".join(md), encoding="utf-8")


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # console do Windows (cp1252)
    cods = [c.upper() for c in sys.argv[1:]] or list(FALAS)
    linhas = []
    with tempfile.TemporaryDirectory() as d:
        tmp = Path(d)
        trilha_wav = gerar_trilha(tmp)
        print(f"Trilha: {TRILHA.relative_to(RAIZ)} ({duracao(TRILHA):.2f} s)")
        for cod in cods:
            falas, fim, out = montar(cod, tmp, trilha_wav)
            nv, na, dur, lufs, pico = conferir(out)
            for voz, texto, _, _, dd in falas:
                linhas.append((cod, voz, texto, dd))
            ok = nv == 1 and na == 1 and abs(dur - DURACAO) < 0.1 and fim < FIM_MAX
            print(f"{cod}: falas {' + '.join(f'{f[4]:.2f}' for f in falas)} s, termina em {fim:.2f} s | "
                  f"{nv} vídeo + {na} áudio, {dur:.2f} s, {lufs:.1f} LUFS, pico {pico:.1f} dBFS "
                  f"{'OK' if ok else 'PROBLEMA'} → {out.relative_to(RAIZ)}")
    if len(cods) == len(FALAS):
        escrever_falas_md(linhas)


if __name__ == "__main__":
    main()
