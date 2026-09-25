# slides/

`apresentacao.pptx` — 13 slides da apresentação do cp-02, com **notas do apresentador**
em cada slide (o que falar e, no slide 4, o roteiro da demonstração ao vivo).

| # | Slide | Item do checklist |
|---|---|---|
| 1 | Capa | |
| 2 | O artigo: MedMNIST v2 (2023) | artigo de 2023 em diante com CNN |
| 3 | Os dados: PneumoniaMNIST | mostrar o dataset |
| 4 | O código dos autores, rodando | código do artigo rodando, inferência funcionando |
| 5 | Onde estão os 11,2 milhões de parâmetros | motivação da modificação |
| 6 | A modificação: uma ResNet-18 enxuta | modificação substancial da arquitetura |
| 7 | Por que essa modificação | justificativa |
| 8 | 36× menor, sem perder desempenho | resultados quantitativos |
| 9 | Prova de treino: 100 épocas | provar que treinou no dataset |
| 10 | Onde cada rede erra | resultados qualitativos |
| 11 | As radiografias em que as redes discordam | resultados qualitativos |
| 12 | Limites deste resultado | |
| 13 | Conclusão | |

Todos os números são os mesmos do relatório (`../relatorio.md`) e rastreiam até os
arquivos em `../resultados/`. As figuras vêm de `../comparacao/` e `../dados/`; os três
raios-X da capa, em `img/`, são imagens reais do conjunto de treino (índices 4407, 2978
e 3133).

## Para gerar de novo

Os slides são gerados por código, a partir das figuras do projeto:

```bash
npm install pptxgenjs
node slides/gerar_slides.js
```

`tema.js` guarda cores e peças visuais (azul = rede do artigo, laranja = rede modificada,
as mesmas cores das figuras); `parte1.js`, `parte2.js` e `parte3.js` montam os slides.
