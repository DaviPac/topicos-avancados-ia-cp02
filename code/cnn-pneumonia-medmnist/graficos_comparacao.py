"""Figuras da comparacao entre a rede do artigo e a arquitetura modificada.

Arquivo NOVO (nao faz parte do projeto original dos autores). Usado por comparar.py;
nao depende de nada do pipeline dos autores.
"""

import matplotlib

matplotlib.use("Agg")  # salva em arquivo, sem precisar de janela grafica

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402
from sklearn.metrics import confusion_matrix, roc_curve  # noqa: E402

ANTES, DEPOIS = "#2a78d6", "#eb6834"  # azul e laranja: separacao validada para daltonismo
SUPERFICIE, TINTA, TINTA_FRACA, GRADE = "#fcfcfb", "#0b0b0b", "#52514e", "#dcdcd8"
RAMPA = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"]
AZUIS = LinearSegmentedColormap.from_list("azuis", RAMPA)


def cor_do_modelo(i):
    return (ANTES, DEPOIS)[i % 2]


def estilizar(ax):
    """Fundo, bordas e marcacoes discretas: o dado aparece, a moldura some."""
    ax.set_facecolor(SUPERFICIE)
    for lado in ("top", "right"):
        ax.spines[lado].set_visible(False)
    for lado in ("left", "bottom"):
        ax.spines[lado].set_color(GRADE)
    ax.tick_params(colors=TINTA_FRACA, labelsize=9)


def figura(*args, **kwargs):
    fig, eixos = plt.subplots(*args, **kwargs)
    fig.patch.set_facecolor(SUPERFICIE)
    for ax in np.atleast_1d(eixos).ravel():
        estilizar(ax)
    return fig, eixos


def salvar(fig, caminho, ajustar=True):
    if ajustar:
        fig.tight_layout()
    fig.savefig(caminho, dpi=160, facecolor=SUPERFICIE)
    plt.close(fig)
    print(f"  {caminho}")


def matriz_confusao(y_true, predicoes, nomes_classes, caminho):
    """Uma matriz por modelo, lado a lado. Cor = proporcao da linha, rotulo = contagem."""
    fig, eixos = figura(1, len(predicoes), figsize=(5.2 * len(predicoes), 4.8))
    for ax, (i, (rotulo, pred)) in zip(np.atleast_1d(eixos), enumerate(predicoes.items())):
        matriz = confusion_matrix(y_true, pred, labels=range(len(nomes_classes)))
        proporcao = matriz / np.maximum(matriz.sum(axis=1, keepdims=True), 1)
        ax.imshow(proporcao, cmap=AZUIS, vmin=0, vmax=1)

        for linha in range(len(nomes_classes)):
            for coluna in range(len(nomes_classes)):
                # texto claro sobre celula escura, escuro sobre celula clara
                cor = "#ffffff" if proporcao[linha, coluna] > 0.55 else TINTA
                ax.text(coluna, linha, f"{matriz[linha, coluna]}\n{proporcao[linha, coluna]:.0%}",
                        ha="center", va="center", color=cor, fontsize=10)

        acuracia = np.trace(matriz) / matriz.sum()
        ax.set_title(f"{rotulo}\nacuracia {acuracia:.1%}", color=TINTA, fontsize=11, pad=10)
        ax.set_xticks(range(len(nomes_classes)), nomes_classes, rotation=20, ha="right")
        ax.set_yticks(range(len(nomes_classes)), nomes_classes)
        ax.set_xlabel("previsto", color=TINTA_FRACA, fontsize=10)
        if i == 0:
            ax.set_ylabel("verdadeiro", color=TINTA_FRACA, fontsize=10)
        # respiro de 2px entre as celulas
        ax.set_xticks(np.arange(-0.5, len(nomes_classes)), minor=True)
        ax.set_yticks(np.arange(-0.5, len(nomes_classes)), minor=True)
        ax.grid(which="minor", color=SUPERFICIE, linewidth=2)
        ax.tick_params(which="minor", length=0)
    salvar(fig, caminho)


def curva_roc(y_true, escores, caminho):
    """Curvas ROC sobrepostas. So faz sentido em tarefa binaria."""
    fig, ax = figura(figsize=(5.6, 5.2))
    ax.plot([0, 1], [0, 1], color=GRADE, linewidth=1.5, linestyle="--", zorder=1)
    for i, (rotulo, escore) in enumerate(escores.items()):
        fpr, tpr, _ = roc_curve(y_true, escore)
        ax.plot(fpr, tpr, color=cor_do_modelo(i), linewidth=2, label=rotulo, zorder=2)
    ax.set_xlabel("taxa de falsos positivos", color=TINTA_FRACA, fontsize=10)
    ax.set_ylabel("taxa de verdadeiros positivos", color=TINTA_FRACA, fontsize=10)
    ax.set_title("Curva ROC no conjunto de teste", color=TINTA, fontsize=11, pad=10)
    ax.grid(color=GRADE, linewidth=0.8, alpha=0.6)
    ax.set_axisbelow(True)
    legenda = ax.legend(frameon=False, loc="lower right", fontsize=10)
    for texto in legenda.get_texts():
        texto.set_color(TINTA)
    salvar(fig, caminho)


def grade_discordancias(imagens, y_true, probabilidades, nomes_classes, rotulos, caminho, n=8):
    """Casos em que os dois modelos discordam: imagem, verdade e o palpite de cada um."""
    previsoes = [p.argmax(axis=1) for p in probabilidades]
    discordam = np.flatnonzero(previsoes[0] != previsoes[1])
    if len(discordam) == 0:
        print("  (os dois modelos concordaram em todas as imagens de teste)")
        return
    escolhidos = discordam[:n]

    colunas = min(4, len(escolhidos))
    linhas = int(np.ceil(len(escolhidos) / colunas))
    # constrained_layout porque imshow trava o aspecto dos eixos, e o tight_layout
    # nesse caso deixa a legenda de uma linha invadir a imagem da linha de cima
    fig, eixos = figura(linhas, colunas, figsize=(3.1 * colunas, 3.8 * linhas),
                         layout="constrained")
    for ax in np.atleast_1d(eixos).ravel():
        ax.axis("off")

    for ax, indice in zip(np.atleast_1d(eixos).ravel(), escolhidos):
        imagem = imagens[indice]
        ax.imshow(imagem, cmap="gray" if imagem.ndim == 2 else None)
        verdade = nomes_classes[int(y_true[indice])]
        legenda = [f"verdadeiro: {verdade}"]
        for i, probs in enumerate(probabilidades):
            palpite = int(previsoes[i][indice])
            acertou = "ok" if palpite == int(y_true[indice]) else "erro"
            legenda.append(f"{rotulos[i]}: {nomes_classes[palpite]} "
                           f"({probs[indice][palpite]:.0%}, {acertou})")
        ax.set_title("\n".join(legenda), fontsize=8, color=TINTA, loc="left", pad=6)

    fig.suptitle(f"Onde as duas redes discordam ({len(discordam)} casos no teste)",
                 color=TINTA, fontsize=11)
    salvar(fig, caminho, ajustar=False)
