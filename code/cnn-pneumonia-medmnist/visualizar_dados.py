"""Mostra o dataset: exemplos de raio-X de cada classe e quantas imagens ha em cada split.

Arquivo NOVO (nao faz parte do projeto original dos autores). Le o .npz direto, sem
passar pelo pipeline de treino.

    python visualizar_dados.py
"""

import argparse
import os

import graficos_comparacao as g  # antes do pyplot: configura o backend sem janela
import matplotlib.pyplot as plt
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
CLASSES = ["normal", "pneumonia"]
CORES = {"normal": "#1baf7a", "pneumonia": "#4a3aa7"}  # validadas para daltonismo
SPLITS = [("train", "treino"), ("val", "validação"), ("test", "teste")]


def linha_de_exemplos(subfig, imagens, titulo):
    subfig.set_facecolor(g.SUPERFICIE)
    subfig.suptitle(titulo, color=g.TINTA, fontsize=10, x=0.02, ha="left")
    for ax, imagem in zip(subfig.subplots(1, len(imagens)), imagens):
        ax.imshow(imagem, cmap="gray", vmin=0, vmax=255)
        ax.axis("off")


def distribuicao(ax, dados):
    largura = 0.38
    posicoes = np.arange(len(SPLITS))
    for i, classe in enumerate(CLASSES):
        contagens = [int((dados[f"{split}_labels"] == i).sum()) for split, _ in SPLITS]
        barras = ax.bar(posicoes + (i - 0.5) * largura, contagens, largura * 0.94,
                        color=CORES[classe], label=classe, zorder=2)
        for barra, n in zip(barras, contagens):
            ax.annotate(f"{n:,}".replace(",", "."), (barra.get_x() + barra.get_width() / 2, n),
                        xytext=(0, 3), textcoords="offset points",
                        ha="center", va="bottom", fontsize=9, color=g.TINTA)
    ax.set_xticks(posicoes, [nome for _, nome in SPLITS])
    ax.set_ylabel("imagens", color=g.TINTA_FRACA, fontsize=10)
    ax.set_title("Imagens por classe em cada split", color=g.TINTA, fontsize=11, pad=10)
    ax.grid(axis="y", color=g.GRADE, linewidth=0.8, alpha=0.6, zorder=0)
    ax.set_ylim(0, ax.get_ylim()[1] * 1.08)  # folga para o rotulo da barra mais alta
    legenda = ax.legend(frameon=False, fontsize=10)
    for texto in legenda.get_texts():
        texto.set_color(g.TINTA)


def main():
    p = argparse.ArgumentParser(description="Figura com amostras e distribuicao do dataset")
    p.add_argument("--npz", default=os.path.join(AQUI, "dados", "pneumoniamnist.npz"))
    p.add_argument("--saida", default=os.path.join(AQUI, "dados", "amostras.png"))
    p.add_argument("--por_classe", type=int, default=6)
    p.add_argument("--seed", type=int, default=0, help="escolhe quais imagens aparecem")
    args = p.parse_args()

    dados = np.load(args.npz)
    rotulos = dados["train_labels"].reshape(-1)
    rng = np.random.default_rng(args.seed)

    fig = plt.figure(figsize=(14, 5.4), layout="constrained", facecolor=g.SUPERFICIE)
    esquerda, direita = fig.subfigures(1, 2, width_ratios=[1.7, 1], wspace=0.04)
    esquerda.set_facecolor(g.SUPERFICIE)
    direita.set_facecolor(g.SUPERFICIE)
    esquerda.suptitle("Exemplos do conjunto de treino (28×28 pixels, ampliados)",
                      color=g.TINTA, fontsize=11)
    for linha, (i, classe) in zip(esquerda.subfigures(2, 1), enumerate(CLASSES)):
        indices = rng.choice(np.flatnonzero(rotulos == i), args.por_classe, replace=False)
        linha_de_exemplos(linha, dados["train_images"][indices], classe)

    ax = direita.subplots()
    g.estilizar(ax)
    distribuicao(ax, dados)

    g.salvar(fig, args.saida, ajustar=False)


if __name__ == "__main__":
    main()
