// Slides 1-5: capa, artigo, dados, código rodando, parâmetros.
const { COR, FONTE, L, texto, titulo, cartao, etiqueta, destaque, imagem } = require("./tema");

function capa(pres) {
  const s = pres.addSlide();
  s.background = { color: COR.escuro };
  texto(s, "cp-02 · Arquiteturas", { x: L.margem, y: 0.9, w: 7, h: 0.4, fontSize: 14, color: COR.sobreEscuro, charSpacing: 2 });
  texto(s, "Menos é mais", { x: L.margem, y: 1.5, w: 8.5, h: 1.3, fontFace: FONTE.titulo, fontSize: 60, bold: true, color: COR.branco, valign: "middle" });
  texto(s, "Enxugando a ResNet-18 do MedMNIST v2 para a escala do PneumoniaMNIST",
    { x: L.margem, y: 2.95, w: 8.2, h: 1.2, fontSize: 24, color: COR.sobreEscuro });
  texto(s, "SEU NOME · Tópicos Avançados em IA", { x: L.margem, y: 6.3, w: 8, h: 0.4, fontSize: 14, color: COR.sobreEscuro });
  ["raiox_1_normal", "raiox_2_pneumonia", "raiox_3_normal"].forEach((nome, i) =>
    s.addImage({ path: `${__dirname}/img/${nome}.png`, x: 10.4, y: 0.6 + i * 2.25, w: 2.0, h: 2.0 }));
  s.addNotes("Apresentar o trabalho: pegamos uma CNN publicada em 2023, reproduzimos o resultado dela e mostramos que uma versão 36 vezes menor da mesma rede tem o mesmo desempenho. As imagens à direita são radiografias reais do dataset.");
}

function artigo(pres) {
  const s = pres.addSlide();
  titulo(s, "O artigo: MedMNIST v2 (2023)");
  texto(s, [
    { text: "Yang et al., Scientific Data 10, 41 (2023)", options: { bullet: true, breakLine: true } },
    { text: "12 bases de imagens biomédicas 2D, padronizadas em 28×28 pixels", options: { bullet: true, breakLine: true } },
    { text: "Baselines com código aberto: github.com/MedMNIST/experiments", options: { bullet: true, breakLine: true } },
    { text: "Rede base: ResNet-18 adaptada para imagens pequenas (convolução inicial 3×3, sem max-pooling)", options: { bullet: true } },
  ], { x: L.margem, y: 1.7, w: 6.7, h: 4.5, fontSize: 19, paraSpaceAfter: 14 });
  cartao(pres, s, 7.8, 1.6, 4.93, 4.7);
  texto(s, "Publicado para o PneumoniaMNIST", { x: 8.1, y: 1.85, w: 4.3, h: 0.4, fontSize: 16, bold: true });
  texto(s, "0,944", { x: 8.1, y: 2.4, w: 2.1, h: 0.9, fontFace: FONTE.titulo, fontSize: 40, bold: true, valign: "middle" });
  texto(s, "0,854", { x: 10.3, y: 2.4, w: 2.1, h: 0.9, fontFace: FONTE.titulo, fontSize: 40, bold: true, valign: "middle" });
  texto(s, "AUC", { x: 8.1, y: 3.3, w: 2.1, h: 0.35, fontSize: 14, color: COR.tintaFraca });
  texto(s, "acurácia", { x: 10.3, y: 3.3, w: 2.1, h: 0.35, fontSize: 14, color: COR.tintaFraca });
  texto(s, "A ResNet-50, 2,1× maior, faz AUC 0,948 e acurácia 0,854: dobrar a rede não melhorou a acurácia.",
    { x: 8.1, y: 4.1, w: 4.3, h: 1.9, fontSize: 16 });
  s.addNotes("O artigo é um benchmark: ele padroniza bases médicas e publica o resultado de redes de referência, com código. Usamos a ResNet-18 dele. O detalhe que motivou tudo: a ResNet-50, com o dobro de parâmetros, não melhorou a acurácia no PneumoniaMNIST.");
}

function dados(pres) {
  const s = pres.addSlide();
  titulo(s, "Os dados: PneumoniaMNIST");
  imagem(s, "dados/amostras.png", L.margem, 1.35, L.util, 2.593);
  const fatos = [
    "5.856 radiografias de tórax pediátricas (Kermany et al., Cell 2018)",
    "Splits oficiais: 4.708 treino · 524 validação · 624 teste",
    "74,2% de pneumonia no treino e na validação, 62,5% no teste",
  ];
  fatos.forEach((f, i) => {
    const x = L.margem + i * (3.85 + 0.29);
    cartao(pres, s, x, 6.2, 3.85, 0.95);
    texto(s, f, { x: x + 0.2, y: 6.2, w: 3.45, h: 0.95, fontSize: 14, valign: "middle" });
  });
  s.addNotes("Cada imagem é uma radiografia de tórax reduzida para 28 por 28 pixels, rotulada como normal ou pneumonia. A base é desbalanceada: três em cada quatro imagens de treino são de pneumonia. E o teste tem proporção diferente, o que vai importar na discussão.");
}

function codigo(pres) {
  const s = pres.addSlide();
  titulo(s, "O código dos autores, rodando");
  cartao(pres, s, L.margem, 1.6, 7.7, 4.6, COR.escuro);
  const linhas = [
    "# treinar a rede do artigo (receita original)",
    "python train_and_eval_pytorch.py \\",
    "   --data_flag pneumoniamnist \\",
    "   --model_flag resnet18 --num_epochs 100",
    "",
    "# inferência com o checkpoint salvo",
    "python train_and_eval_pytorch.py \\",
    "   --data_flag pneumoniamnist --model_flag resnet18 \\",
    "   --num_epochs 0 \\",
    "   --model_path ../resultados/antes/best_model.pth",
    "",
    "test  auc: 0.94939  acc: 0.87179",
  ];
  texto(s, linhas.map((l, i) => ({ text: l, options: { breakLine: i < linhas.length - 1, bold: i === linhas.length - 1,
    color: l.startsWith("#") ? COR.sobreEscuro : COR.branco } })),
    { x: L.margem + 0.3, y: 1.85, w: 7.1, h: 4.1, fontFace: "Courier New", fontSize: 13 });
  destaque(pres, s, 8.7, 1.6, 4.03, 2.2, "0,949 · 0,872", "AUC e acurácia no teste, na nossa execução", { tamanho: 32 });
  texto(s, "Publicado: 0,944 · 0,854. A diferença cabe na variação entre execuções (o script não fixa semente): a reprodução vale.",
    { x: 8.7, y: 4.05, w: 4.03, h: 1.2, fontSize: 15 });
  texto(s, "Projeto oficial copiado inteiro (commit 70b6b3a). Só a arquitetura mudou.",
    { x: 8.7, y: 5.35, w: 4.03, h: 0.85, fontSize: 15, color: COR.tintaFraca });
  s.addNotes("DEMONSTRAÇÃO: rodar o segundo comando ao vivo, de dentro de MedMNIST2D. Com --num_epochs 0 o script dos autores só carrega o checkpoint e avalia; a linha de teste tem que sair exatamente 0.94939 e 0.87179. Depois repetir com --model_flag resnet18slim e ../resultados/depois/best_model.pth: 0.96377 e 0.87500.");
}

function parametros(pres) {
  const s = pres.addSlide();
  titulo(s, "Onde estão os 11,2 milhões de parâmetros");
  s.addChart(pres.charts.BAR, [{
    name: "parâmetros (milhões)",
    labels: ["estágio 1 · 28×28", "estágio 2 · 14×14", "estágio 3 · 7×7", "estágio 4 · 4×4"],
    values: [0.149, 0.526, 2.100, 8.394],
  }], {
    x: L.margem, y: 1.45, w: 7.9, h: 5.4, barDir: "col", chartColors: [COR.antes],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.00" M"',
    dataLabelFontSize: 13, dataLabelColor: COR.tinta, showLegend: false,
    catAxisLabelColor: COR.tintaFraca, catAxisLabelFontSize: 13, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
  });
  destaque(pres, s, 8.9, 1.6, 3.83, 5.1, "75,2%",
    "da rede inteira (8.393.728 parâmetros) está no estágio 4 — que enxerga um mapa de apenas 4×4 pixels.",
    { tamanho: 54 });
  s.addNotes("A ResNet vai reduzindo a imagem a cada estágio e aumentando os filtros. Em imagens de 28 por 28, o último estágio trabalha sobre 4 por 4 pixels, quase nada, e mesmo assim concentra três quartos de todos os pesos. É o pior negócio da rede.");
}

module.exports = { capa, artigo, dados, codigo, parametros };
