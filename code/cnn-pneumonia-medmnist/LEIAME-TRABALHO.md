# Trabalho — modificar a arquitetura de uma CNN existente

Prática da disciplina de Tópicos Avançados em IA: *selecionar, baixar e retreinar uma
rede existente em uma base de dados existente, implementar uma modificação na sua
arquitetura, re-treinar e comparar os resultados antes e depois*.

A estratégia aqui foi **copiar o projeto oficial dos autores e mudar só a
arquitetura**. Assim o "antes" é literalmente o código deles, e a única variável entre
as duas execuções é a rede — otimizador, scheduler, transformações, divisão dos dados
e métricas são idênticos.

## De onde veio o código e os dados

| | |
|---|---|
| **Artigo** | Yang, J., Shi, R., Wei, D., Liu, Z., Zhao, L., Ke, B., Pfister, H., Ni, B. *MedMNIST v2 — A large-scale lightweight benchmark for 2D and 3D biomedical image classification.* **Scientific Data 10, 41 (2023)** |
| **Código copiado** | https://github.com/MedMNIST/experiments — commit `70b6b3a7ad7afddff1df2a3b735235830fbdb142` (11/07/2024), licença Apache-2.0 |
| **Dataset** | **PneumoniaMNIST**: 5.856 raios-X de tórax pediátricos, classificação binária (normal × pneumonia), 1×28×28, splits oficiais 4.708 / 524 / 624, licença CC BY 4.0. Baixado automaticamente pelo pacote `medmnist` com a flag `--download` |
| **Rede base** | `MedMNIST2D/models.py::ResNet18` — ResNet-18 estilo CIFAR (primeira convolução 3×3 com passo 1, sem max-pooling), a mesma que produziu os números publicados |

**Números publicados no artigo** para PneumoniaMNIST em resolução 28 (é o alvo a bater
para provar que a reprodução da base está correta):

| Modelo do artigo | AUC | ACC |
|---|---|---|
| ResNet-18 (28) | 0,944 | 0,854 |
| ResNet-50 (28) | 0,948 | 0,854 |
| ResNet-18 (224) | 0,956 | 0,864 |
| ResNet-50 (224) | 0,962 | 0,884 |

## A modificação

Uma ResNet-18 enxugada para a escala do problema (`ResNet18Slim`, em
`MedMNIST2D/models.py`), construída com o mesmo `BasicBlock` dos autores:

| | ResNet-18 (artigo) | Enxuta (este trabalho) |
|---|---|---|
| Estágios residuais | 4 | **3** |
| Blocos por estágio | 2, 2, 2, 2 | **1, 1, 1** |
| Canais por estágio | 64, 128, 256, 512 | **32, 64, 128** |
| Resolução ao longo da rede | 28 → 28 → 14 → 7 → 4 | 28 → 28 → 14 → **7** |
| Parâmetros | 11.168.706 | **307.042** (97,3% a menos, 36× menor) |

### Por que essa modificação

1. **Capacidade desproporcional ao dado.** São ~11,2 milhões de parâmetros para
   4.708 imagens de treino de 28×28 numa tarefa de duas classes — cerca de 2.400
   parâmetros por exemplo de treino.
2. **O próprio artigo mostra que mais capacidade não ajuda aqui.** Na tabela acima, a
   ResNet-50 (28), com 2,1× mais parâmetros (23.503.298), empata com a ResNet-18 (28) em acurácia
   (0,854) e fica a 0,004 de AUC. Se dobrar a rede não melhora, a hipótese de que dá
   para cortar é razoável — e testável.
3. **O 4º estágio é o pior negócio da rede.** Ele opera sobre mapas de 4×4 pixels,
   resolução em que quase não resta estrutura espacial, e mesmo assim concentra
   **8.393.728 parâmetros — 75,2% da rede inteira**. Removê-lo é onde mais se corta
   com menos perda esperada. A distribuição completa sai de
   `verificacao/contar_parametros.py`:

   | Parte | ResNet-18 | % da rede | Vê mapas de |
   |---|---|---|---|
   | tronco + layer1 | 148.672 | 1,3% | 28×28 |
   | layer2 | 525.568 | 4,7% | 14×14 |
   | layer3 | 2.099.712 | 18,8% | 7×7 |
   | **layer4** | **8.393.728** | **75,2%** | **4×4** |
   | classificador | 1.026 | 0,0% | — |

**Hipótese a testar:** acurácia e AUC equivalentes às da rede original, com uma fração
dos parâmetros e do tempo de treino. O resultado é reportado como sair — inclusive se
a hipótese cair. (Confirmou-se, e com uma margem a mais do que o esperado: veja
[Resultados](#resultados).)

### O diff, na íntegra

Só dois arquivos do projeto original foram tocados; todo trecho alterado está marcado
com o comentário `MODIFICACAO (trabalho)`:

- **`MedMNIST2D/models.py`** — a classe `ResNet` tinha os quatro estágios e as larguras
  fixos no `__init__`. Passou a aceitar `widths` e um `num_blocks` de tamanho variável,
  e o 4º estágio virou opcional. **Com os valores padrão a rede continua idêntica à
  original**, inclusive nos nomes dos parâmetros (`layer1..layer4`), então checkpoints
  antigos continuam carregando. No fim do arquivo entrou a função `ResNet18Slim`.
- **`MedMNIST2D/train_and_eval_pytorch.py`** — o `import` e um `elif model_flag ==
  'resnet18slim'`, sem o qual não há como selecionar a rede nova pela linha de comando.
  Nenhuma outra linha do pipeline foi tocada.

Arquivos **novos** (não alteram nada dos autores): este `LEIAME-TRABALHO.md`,
`CONTEXT.md`, `requirements.txt`, `comparar.py`, `graficos_comparacao.py`,
`curvas_treino.py`, `visualizar_dados.py` e as pastas `verificacao/`, `dados/` e
`resultados/` (checkpoints e logs das duas execuções — ver `resultados/LEIAME.md`).

## Como rodar

```bash
pip install -r requirements.txt
```

Comparar as duas arquiteturas (o `--download` baixa o PneumoniaMNIST na primeira vez;
em CPU, `--gpu_ids -1` é obrigatório porque o padrão do script é GPU):

```bash
cd MedMNIST2D

# ANTES — a rede do artigo
python train_and_eval_pytorch.py --data_flag pneumoniamnist --model_flag resnet18 \
    --num_epochs 100 --download --gpu_ids -1 --run antes

# DEPOIS — a arquitetura modificada
python train_and_eval_pytorch.py --data_flag pneumoniamnist --model_flag resnet18slim \
    --num_epochs 100 --download --gpu_ids -1 --run depois
```

Cada execução cria `output/pneumoniamnist/<data_hora>/` com o melhor checkpoint
(`best_model.pth`), os CSVs de avaliação e os logs do Tensorboard.

### Inferência antes e depois (o que mostrar na apresentação)

O próprio script dos autores faz isso: com `--num_epochs 0` ele não treina, só carrega
o checkpoint e roda a avaliação nos três splits.

```bash
python train_and_eval_pytorch.py --data_flag pneumoniamnist --model_flag resnet18 \
    --num_epochs 0 --gpu_ids -1 --model_path output/pneumoniamnist/<data_hora>/best_model.pth

python train_and_eval_pytorch.py --data_flag pneumoniamnist --model_flag resnet18slim \
    --num_epochs 0 --gpu_ids -1 --model_path output/pneumoniamnist/<data_hora>/best_model.pth
```

### Comparação antes × depois (quantitativa e qualitativa)

Com os dois checkpoints em mãos, um comando produz todo o material da comparação:

```bash
python comparar.py \
    --antes  MedMNIST2D/output/pneumoniamnist/<data_hora>/best_model.pth \
    --depois MedMNIST2D/output/pneumoniamnist/<data_hora>/best_model.pth
```

No terminal sai a tabela quantitativa (parâmetros, AUC e ACC pelo mesmo `Evaluator`
oficial do artigo, e tempo de inferência por imagem). Em `comparacao/` saem três
figuras para os slides:

- `matriz_confusao.png` — as duas redes lado a lado, com contagem e percentual por
  linha (mostra em qual das duas classes cada rede erra mais);
- `curva_roc.png` — as duas curvas sobrepostas;
- `discordancias.png` — os raios-X em que as redes discordam entre si, com o palpite
  e a confiança de cada uma. É a figura que mais rende na apresentação, porque mostra
  *onde* a mudança de arquitetura alterou o comportamento, não só o placar.

As curvas de acurácia e perda por época ficam no TensorBoard, que o script dos autores
já grava:

```bash
tensorboard --logdir MedMNIST2D/output/pneumoniamnist
```

E para mostrar o tamanho das duas redes lado a lado, sem treinar nada:

```bash
python verificacao/contar_parametros.py   # rodar na raiz do projeto
```

Para conferir que nada quebrou (roda offline, em segundos, sem baixar dataset):

```bash
python verificacao/testar_redes.py
```

## Resultados

Treino completo das duas redes no PneumoniaMNIST, 100 épocas cada, com a receita do
artigo, em CPU de 4 núcleos.

### Placar

| | ResNet-18 (artigo) | Enxuta (este trabalho) | Publicado no artigo |
|---|---|---|---|
| Parâmetros | 11.168.706 | **307.042** (36× menos) | — |
| AUC (teste) | 0,949 | **0,964** | 0,944 |
| ACC (teste) | 0,872 | **0,875** | 0,854 |
| Treino completo (100 épocas) | 119 min | **17 min** (6,8× mais rápido) | — |
| Inferência por imagem² | 4,3–4,8 ms | **0,55–0,61 ms** (7–8× mais rápido) | — |

² Três medições em CPU, registradas em `resultados/comparacao.txt`. O tempo absoluto
varia com a carga da máquina; a razão entre as duas redes é o que se mantém.

**A reprodução da base confere:** 0,949 / 0,872 contra os 0,944 / 0,854 publicados. A
pequena diferença é esperada — o script dos autores não fixa semente aleatória, então
cada execução varia um pouco. O "antes" vale como referência.

**A hipótese se confirmou, e com folga:** a rede enxuta não apenas empatou, ela **ficou
à frente nas duas métricas de teste** (+0,015 de AUC e +0,003 de acurácia) usando 3% dos
parâmetros e um sétimo do tempo de treino. Cortar capacidade não custou acurácia neste
problema — melhorou.

### O que os números de treino revelam

| | ResNet-18 (artigo) | Enxuta |
|---|---|---|
| ACC no treino | 0,9996 | 0,9979 |
| ACC no teste | 0,872 | 0,875 |
| Distância treino → teste | **12,8 pontos** | 12,3 pontos |

A rede do artigo **memoriza o conjunto de treino inteiro** (AUC 1,000, praticamente
nenhum erro em 4.708 imagens) e ainda assim entrega 87% no teste. É o retrato de uma
rede com capacidade sobrando para o tamanho do dado — exatamente a premissa da
modificação. A rede enxuta, com 36× menos parâmetros, também satura o treino, o que
sugere que ainda haveria espaço para encolher mais.

### O que as figuras mostram (análise qualitativa)

- **`matriz_confusao.png`** — as duas redes acertam 98% dos casos de pneumonia, mas só
  68% (base) e 70% (enxuta) dos casos normais. Ou seja: ambas erram para o mesmo lado,
  chutando "pneumonia" na dúvida. Isso não é defeito da arquitetura, é o reflexo do
  desbalanceamento do treino (74% das imagens são de pneumonia). Num uso clínico esse
  viés é o menos ruim dos dois — deixa passar poucos doentes ao custo de falsos alarmes
  — mas é uma limitação a declarar, não a esconder.
- **`curva_roc.png`** — a enxuta fica acima da base na região de poucos falsos
  positivos, que é a faixa de operação que interessaria num rastreamento real.
- **`discordancias.png`** — os raios-X em que as duas discordam, com a confiança de
  cada uma. É onde se vê *o que* mudou de comportamento, e não só o placar.

## Como estes resultados foram produzidos

Ambiente: Linux, CPU de 4 núcleos, torch 2.14, medmnist 3.0.2. Dataset conferido pelo
MD5 oficial (`28209eda62fecd6e6a2d98b1501bb15f`) antes de qualquer treino. As duas redes
rodaram **em sequência, não em paralelo**, para que o tempo por época de uma não fosse
inflado pela disputa de CPU com a outra.

Além do treino, foi verificado que:

- **A rede base continua idêntica à dos autores.** Comparação direta com o `models.py`
  original do commit `70b6b3a`: mesmos nomes e formatos de parâmetros, mesma contagem
  (11.168.706 para ResNet-18 e 23.503.298 para ResNet-50) e **a mesma saída para os
  mesmos pesos**. Os números estão travados em `verificacao/testar_redes.py`.
- **As duas redes constroem, treinam e avaliam** pelo script oficial sem nenhuma
  alteração no pipeline, incluindo o modo de inferência `--num_epochs 0 --model_path`,
  que carregou os dois checkpoints e reproduziu exatamente os números do treino.
- **O `comparar.py` roda de ponta a ponta** com os dois checkpoints e gera as três
  figuras. Elas foram abertas e conferidas (sem texto sobreposto nem eixo cortado).
- `verificacao/testar_redes.py`: 5 testes passando (rede base intacta, rede enxuta
  menor e com 3 estágios, mesma interface de entrada/saída, resolução de cada estágio,
  e um treino proposital de 30 passos que derruba a perda — prova que a rede nova
  aprende).

### Limites destes resultados

Três ressalvas que valem ser ditas na apresentação, em vez de esperar que alguém
pergunte:

1. **Uma execução de cada.** O script dos autores não fixa semente, então parte da
   diferença entre as duas redes pode ser variação de rodada. Para afirmar a vantagem
   com segurança seria preciso repetir cada treino algumas vezes e comparar as médias.
   O que a execução única já sustenta é o essencial: a rede enxuta **não perdeu**
   acurácia, custando 36× menos parâmetros.
2. **Acurácia não é a métrica que importa num diagnóstico.** Com 74% de pneumonia no
   treino, as duas redes aprenderam a chutar "pneumonia" na dúvida, e erram quase um
   terço dos casos normais. A matriz de confusão mostra isso com clareza.
3. **28×28 é uma miniatura.** O PneumoniaMNIST reduz raios-X originais de até
   2.916×2.713 pixels. Nada aqui diz respeito a desempenho clínico real; o objeto de
   estudo é a arquitetura, não o diagnóstico.

## Referências

- Yang et al. *MedMNIST v2 — A large-scale lightweight benchmark for 2D and 3D
  biomedical image classification.* Scientific Data 10, 41 (2023).
- He, K., Zhang, X., Ren, S., Sun, J. *Deep Residual Learning for Image Recognition.*
  CVPR 2016. (origem do bloco residual usado pelas duas redes)
- Kermany, D. et al. *Identifying Medical Diagnoses and Treatable Diseases by
  Image-Based Deep Learning.* Cell, 2018. (origem dos raios-X que o PneumoniaMNIST
  padronizou)
