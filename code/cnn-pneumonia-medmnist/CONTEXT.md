# cnn-pneumonia-medmnist/

Cópia do projeto oficial **MedMNIST/experiments** com **uma única alteração: a
arquitetura da rede**. Prática da disciplina de Tópicos Avançados em IA (modificar a
arquitetura de uma rede existente, retreinar e comparar antes/depois).

Leia o [`LEIAME-TRABALHO.md`](LEIAME-TRABALHO.md) para os comandos e os resultados.

## O que é de quem

| Origem | Arquivos |
|--------|----------|
| **Dos autores** (github.com/MedMNIST/experiments, commit `70b6b3a`, Apache-2.0) | `README.md`, `LICENSE`, `MedMNIST2D/`, `MedMNIST3D/`, `.gitignore` |
| **Alterado por este trabalho** | `MedMNIST2D/models.py`, `MedMNIST2D/train_and_eval_pytorch.py` |
| **Novo, criado por este trabalho** | `LEIAME-TRABALHO.md`, `CONTEXT.md`, `requirements.txt`, `comparar.py`, `graficos_comparacao.py`, `curvas_treino.py`, `visualizar_dados.py`, `verificacao/`, `dados/`, `resultados/` |

Todo trecho alterado no código dos autores está marcado com o comentário
`MODIFICACAO (trabalho)` — é só buscar por essa string para ver o diff inteiro.

## Organização

- `MedMNIST2D/models.py` — ResNet-18/50 dos autores + `ResNet18Slim`, a arquitetura
  proposta. A classe `ResNet` ganhou os parâmetros de largura e número de estágios;
  com os valores padrão ela continua idêntica à original.
- `MedMNIST2D/train_and_eval_pytorch.py` — script oficial de treino e avaliação.
  A única mudança é o `elif` que permite selecionar `--model_flag resnet18slim`.
  Otimizador, scheduler, transformações, splits e métricas são os dos autores.
- `MedMNIST3D/` — parte 3D do projeto original. Não é usada aqui; ficou porque a
  orientação foi copiar o projeto inteiro.
- `visualizar_dados.py` — gera `dados/amostras.png`: raios-X de exemplo por classe e
  quantas imagens de cada classe há em cada split.
- `curvas_treino.py` — gera `comparacao/curvas_treino.png` a partir dos logs do
  TensorBoard em `resultados/`: perda e AUC de validação por época, antes × depois.
- `resultados/` — checkpoints (`best_model.pth`), logs, CSVs e TensorBoard das duas
  execuções reais. Permite demonstrar a inferência sem retreinar.
- `comparar.py` — carrega os dois checkpoints e produz a comparação antes × depois:
  tabela no terminal (parâmetros, AUC/ACC pelo `Evaluator` oficial, ms por imagem) e
  as figuras. Só lê o que o script dos autores gravou; não altera nada deles.
- `graficos_comparacao.py` — as três figuras (matriz de confusão, ROC, discordâncias).
  Paleta escolhida para continuar legível em impressão e para daltônicos.
- `verificacao/contar_parametros.py` — compara as duas redes (parâmetros por parte da
  rede e formato dos mapas de ativação). Não treina nada.
- `verificacao/testar_redes.py` — testes que rodam offline em segundos. O principal
  trava os números da rede base: se alguém mexer sem querer na `ResNet` e a base deixar
  de ser a do artigo, a comparação antes/depois perde o sentido e o teste acusa.
- `output/` — gerado pelo treino (checkpoints, CSVs, Tensorboard). Não versionado.

## Convenções

- **Não reescrever o pipeline dos autores.** A comparação antes/depois só é justa
  porque tudo, exceto a arquitetura, é idêntico entre as duas execuções.
- Arquivos novos vão em `verificacao/` ou na raiz; não misturar com o código original.
- Em CPU, passar sempre `--gpu_ids -1` (o padrão do script é `0`, que assume GPU).
