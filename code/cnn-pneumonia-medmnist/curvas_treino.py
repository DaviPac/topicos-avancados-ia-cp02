"""Curvas de treino das duas redes, epoca a epoca, lidas dos logs do TensorBoard.

Arquivo NOVO (nao faz parte do projeto original dos autores). So le o que o script dos
autores gravou em Tensorboard_Results/; nao treina nada.

Mostra apenas treino e validacao. O teste fica de fora de proposito: o script dos
autores escolhe o checkpoint pela AUC de validacao, e olhar o teste epoca a epoca
convidaria a escolher pelo teste.

    python curvas_treino.py
"""

import argparse
import os

import graficos_comparacao as g
from tensorboard.backend.event_processing.event_accumulator import EventAccumulator

AQUI = os.path.dirname(os.path.abspath(__file__))
DECAIMENTOS = (50, 75)  # epocas em que o script dos autores divide o lr por 10


def ler(pasta, *tags):
    ea = EventAccumulator(pasta, size_guidance={"scalars": 0})
    ea.Reload()
    return {tag: [e.value for e in ea.Scalars(tag)] for tag in tags}


def melhor_epoca(val_auc):
    """Mesma regra do script dos autores: primeira epoca que supera estritamente a melhor."""
    melhor, epoca = 0.0, 0
    for i, auc in enumerate(val_auc):
        if auc > melhor:
            melhor, epoca = auc, i
    return epoca


def marcar_decaimentos(ax):
    for epoca in DECAIMENTOS:
        ax.axvline(epoca, color=g.GRADE, linewidth=1, zorder=0)
        ax.annotate("lr ÷10", (epoca, 1), xycoords=("data", "axes fraction"),
                    xytext=(3, -3), textcoords="offset points",
                    ha="left", va="top", fontsize=8, color=g.TINTA_FRACA)


def painel_perda(ax, series):
    for i, (rotulo, s) in enumerate(series.items()):
        epocas = range(1, len(s["train_loss"]) + 1)
        ax.plot(epocas, s["train_loss"], color=g.cor_do_modelo(i), linewidth=2,
                label=f"{rotulo} — treino")
        ax.plot(epocas, s["val_loss"], color=g.cor_do_modelo(i), linewidth=2,
                linestyle=(0, (4, 2)), label=f"{rotulo} — validação")
    ax.set_yscale("log")
    ax.set_title("Perda por época (escala logarítmica)", color=g.TINTA, fontsize=11, pad=10)
    ax.set_ylabel("perda (entropia cruzada)", color=g.TINTA_FRACA, fontsize=10)
    # a faixa entre 1e-2 e 1e-4 no fim do treino fica vazia; e o unico lugar sem linha
    legenda = ax.legend(frameon=False, fontsize=9, loc="center right")
    for texto in legenda.get_texts():
        texto.set_color(g.TINTA)


def painel_auc(ax, series):
    finais = [s["val_auc"][-1] for s in series.values()]
    for i, (rotulo, s) in enumerate(series.items()):
        auc = s["val_auc"]
        epocas = range(1, len(auc) + 1)
        cor = g.cor_do_modelo(i)
        ax.plot(epocas, auc, color=cor, linewidth=2, zorder=2)
        escolhida = melhor_epoca(auc)
        # anel da cor da superficie em volta do marcador, para ele nao se fundir com a linha
        ax.plot(escolhida + 1, auc[escolhida], "o", markersize=9, color=cor,
                markeredgecolor=g.SUPERFICIE, markeredgewidth=2, zorder=3)
        ax.annotate(f"época {escolhida + 1}", (escolhida + 1, auc[escolhida]),
                    xytext=(0, 9), textcoords="offset points",
                    ha="center", va="bottom", fontsize=8, color=g.TINTA)
        # rotulo na ponta: a linha que termina mais alto leva o rotulo para cima
        acima = auc[-1] >= max(finais)
        ax.annotate(rotulo, (len(auc), auc[-1]), xytext=(6, 7 if acima else -7),
                    textcoords="offset points", va="center", fontsize=9, color=g.TINTA)
    ax.set_ylim(0.97, 1.0)
    ax.set_title("AUC de validação por época  (● = checkpoint usado: maior AUC de validação)",
                 color=g.TINTA, fontsize=11, pad=10)
    ax.set_ylabel("AUC", color=g.TINTA_FRACA, fontsize=10)


def main():
    p = argparse.ArgumentParser(description="Curvas de treino antes x depois")
    p.add_argument("--antes", default=os.path.join(AQUI, "resultados", "antes", "Tensorboard_Results"))
    p.add_argument("--depois", default=os.path.join(AQUI, "resultados", "depois", "Tensorboard_Results"))
    p.add_argument("--saida", default=os.path.join(AQUI, "comparacao", "curvas_treino.png"))
    args = p.parse_args()

    tags = ("train_loss", "val_loss", "val_auc")
    series = {"antes (artigo)": ler(args.antes, *tags), "depois (modificada)": ler(args.depois, *tags)}

    fig, (esq, dir_) = g.figura(1, 2, figsize=(14, 5), layout="constrained",
                                gridspec_kw={"width_ratios": [1, 1.15]})
    painel_perda(esq, series)
    painel_auc(dir_, series)
    for ax in (esq, dir_):
        ax.set_xlabel("época", color=g.TINTA_FRACA, fontsize=10)
        ax.set_xlim(1, 100)
        ax.grid(color=g.GRADE, linewidth=0.8, alpha=0.6)
        ax.set_axisbelow(True)
        marcar_decaimentos(ax)
    g.salvar(fig, args.saida, ajustar=False)


if __name__ == "__main__":
    main()
