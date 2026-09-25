# resultados/

Tudo o que as duas execuções de treino produziram, exatamente como o script dos autores
gravou. É a prova de que as redes foram treinadas no PneumoniaMNIST real, e é o que
permite demonstrar a inferência sem precisar treinar de novo.

| Pasta | Rede | Treino |
|---|---|---|
| `antes/` | ResNet-18 do artigo (`--model_flag resnet18`) | 100 épocas, 119 min |
| `depois/` | ResNet-18 enxuta, a modificação (`--model_flag resnet18slim`) | 100 épocas, 17 min |

Em cada pasta:

- `best_model.pth` — pesos da época com melhor AUC de validação, que é o critério de
  seleção do script dos autores;
- `pneumoniamnist_log.txt` — AUC e ACC finais em treino, validação e teste;
- `pneumoniamnist_{train,val,test}_[AUC]…_[ACC]…@….csv` — a probabilidade que a rede
  atribuiu a cada classe, imagem por imagem, em cada split (é daqui que saem as métricas);
- `Tensorboard_Results/` — perda, AUC e ACC por época. As curvas em
  `../comparacao/curvas_treino.png` são geradas a partir destes arquivos.

`execucao.log` registra início, fim e duração de cada treino e cada vez que a AUC de
validação melhorou.

## Condições das execuções

- 25/09/2026, Linux, CPU de 4 núcleos, sem GPU; torch 2.14, medmnist 3.0.2.
- Dataset conferido pelo MD5 oficial antes de treinar
  (`28209eda62fecd6e6a2d98b1501bb15f`, ver `../dados/LEIAME.md`).
- Receita do artigo, sem alteração: Adam, lr 0,001, batch 128, 100 épocas, lr × 0,1
  nas épocas 50 e 75.
- As duas redes rodaram uma depois da outra, não em paralelo, para que o tempo de uma
  não fosse inflado pela disputa de CPU com a outra.
- Uma execução por rede. O script dos autores não fixa semente aleatória, então uma nova
  execução dá números ligeiramente diferentes.

## Demonstrar a inferência com estes pesos

Com o dataset em `~/.medmnist/` (ver `../dados/LEIAME.md`), de dentro de `MedMNIST2D/`:

```bash
python train_and_eval_pytorch.py --data_flag pneumoniamnist --model_flag resnet18 \
    --num_epochs 0 --gpu_ids -1 --model_path ../resultados/antes/best_model.pth

python train_and_eval_pytorch.py --data_flag pneumoniamnist --model_flag resnet18slim \
    --num_epochs 0 --gpu_ids -1 --model_path ../resultados/depois/best_model.pth
```

`--num_epochs 0` faz o script dos autores pular o treino e só avaliar. As duas linhas de
`test` devem reproduzir exatamente os números do `pneumoniamnist_log.txt` de cada pasta.
