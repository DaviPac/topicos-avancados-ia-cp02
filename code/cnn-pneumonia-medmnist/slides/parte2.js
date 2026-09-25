// Slides 6-9: modificação, justificativa, resultados, curvas de treino.
const { COR, FONTE, L, texto, titulo, cartao, etiqueta, destaque, imagem } = require("./tema");

// Uma fileira de estágios da rede, desenhada como blocos; `removidos` vira contorno tracejado.
function fileira(pres, s, y, qual, estagios, removidos = 0) {
  etiqueta(pres, s, L.margem, y + 0.32, qual);
  const cor = qual === "antes" ? COR.antes : COR.depois;
  const w = 2.2, gap = 0.25, x0 = 2.05;
  estagios.forEach((rotulo, i) => {
    const x = x0 + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 1.0, rectRadius: 0.1, fill: { color: cor }, line: { color: cor } });
    texto(s, rotulo, { x, y, w, h: 1.0, fontSize: 13, color: COR.branco, align: "center", valign: "middle" });
  });
  for (let k = 0; k < removidos; k++) {
    const x = x0 + (estagios.length + k) * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 1.0, rectRadius: 0.1,
      fill: { color: COR.branco }, line: { color: COR.tintaFraca, width: 1.5, dashType: "dash" } });
    texto(s, "removido", { x, y, w, h: 1.0, fontSize: 14, italic: true, color: COR.tintaFraca, align: "center", valign: "middle" });
  }
}

function modificacao(pres) {
  const s = pres.addSlide();
  titulo(s, "A modificação: uma ResNet-18 enxuta");
  fileira(pres, s, 1.5, "antes", ["28×28 · 64 filtros\n2 blocos", "14×14 · 128 filtros\n2 blocos",
    "7×7 · 256 filtros\n2 blocos", "4×4 · 512 filtros\n2 blocos"]);
  fileira(pres, s, 2.85, "depois", ["28×28 · 32 filtros\n1 bloco", "14×14 · 64 filtros\n1 bloco",
    "7×7 · 128 filtros\n1 bloco"], 1);
  texto(s, [
    { text: "Remove o estágio 4 inteiro (4×4 pixels, 75% dos pesos)", options: { bullet: true, breakLine: true } },
    { text: "1 bloco residual por estágio, em vez de 2", options: { bullet: true, breakLine: true } },
    { text: "Metade dos filtros em cada estágio", options: { bullet: true, breakLine: true } },
    { text: "Mantém o bloco residual e o resto do pipeline dos autores", options: { bullet: true } },
  ], { x: L.margem, y: 4.45, w: 7.6, h: 2.5, fontSize: 18, paraSpaceAfter: 8 });
  destaque(pres, s, 8.7, 4.35, 4.03, 2.55, "36× menor", "11.168.706 → 307.042 parâmetros", { tamanho: 36 });
  s.addNotes("Três cortes ao mesmo tempo: tiramos o último estágio, deixamos um bloco residual por estágio e cortamos os filtros pela metade. O tipo de rede continua o mesmo, uma ResNet; ela só ficou do tamanho do problema. No código, isso é uma classe ResNet que ganhou dois parâmetros e duas linhas no script de treino.");
}

function porque(pres) {
  const s = pres.addSlide();
  titulo(s, "Por que essa modificação");
  const motivos = [
    ["2.400", "parâmetros por imagem de treino: 11,2 milhões de pesos para só 4.708 radiografias."],
    ["2,1×", "maior, a ResNet-50 não melhora a acurácia no próprio artigo (0,854 nas duas)."],
    ["75%", "dos pesos estão no estágio que enxerga só 4×4 pixels."],
  ];
  motivos.forEach(([n, legenda], i) =>
    destaque(pres, s, L.margem + i * (3.8 + 0.365), 1.6, 3.8, 3.7, n, legenda, { tamanho: 54 }));
  texto(s, "Hipótese: uma fração dos parâmetros basta para o mesmo desempenho.",
    { x: L.margem, y: 5.75, w: L.util, h: 0.7, fontFace: FONTE.titulo, fontSize: 24, italic: true });
  s.addNotes("A justificativa tem três evidências, todas verificáveis: a proporção de parâmetros por imagem, a tabela do próprio artigo e a distribuição de pesos que acabamos de ver. Daí a hipótese, que dá para testar: cortar não deveria custar desempenho.");
}

function resultados(pres) {
  const s = pres.addSlide();
  titulo(s, "36× menor, sem perder desempenho");
  etiqueta(pres, s, L.margem, 1.3, "antes");
  texto(s, "→", { x: 1.85, y: 1.3, w: 0.4, h: 0.36, fontSize: 18, align: "center", valign: "middle" });
  etiqueta(pres, s, 2.3, 1.3, "depois");
  const cartoes = [
    ["AUC no teste", "0,949", "0,964"],
    ["Acurácia no teste", "0,872", "0,875"],
    ["Parâmetros", "11,2 M", "0,31 M"],
    ["Treino (100 épocas)", "119 min", "17 min"],
    ["Inferência por imagem", "4,3–4,8 ms", "0,55–0,61 ms"],
    ["Publicado no artigo", "", "0,944 · 0,854"],
  ];
  cartoes.forEach(([rotulo, antes, depois], i) => {
    const x = L.margem + (i % 3) * (3.8 + 0.365), y = 1.95 + Math.floor(i / 3) * 2.55;
    cartao(pres, s, x, y, 3.8, 2.3, i === 5 ? COR.branco : COR.cartao);
    if (i === 5) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.8, h: 2.3, rectRadius: 0.12,
      fill: { color: COR.branco, transparency: 100 }, line: { color: COR.grade, width: 1.25 } });
    texto(s, rotulo, { x: x + 0.3, y: y + 0.25, w: 3.2, h: 0.4, fontSize: 14, color: COR.tintaFraca });
    if (antes) texto(s, `${antes}  →`, { x: x + 0.3, y: y + 0.7, w: 3.2, h: 0.45, fontSize: 20, color: COR.tintaFraca });
    texto(s, depois, { x: x + 0.3, y: y + 1.2, w: 3.2, h: 0.8, fontFace: FONTE.titulo, bold: true,
      fontSize: depois.length > 9 ? 28 : 38, valign: "middle" });
  });
  s.addNotes("Mesma receita de treino, mesma base, só a arquitetura diferente. A rede enxuta fez AUC 0,964 contra 0,949 e acurácia praticamente igual, com 36 vezes menos parâmetros, treinando em 17 minutos em vez de 119. O último cartão é a referência publicada no artigo.");
}

function curvas(pres) {
  const s = pres.addSlide();
  titulo(s, "Prova de treino: 100 épocas, curva a curva");
  imagem(s, "comparacao/curvas_treino.png", L.margem, 1.3, L.util, 2.8);
  const notas = [
    "A perda de validação da base sobe 78% depois do mínimo; a da enxuta, só 15%.",
    "Checkpoints escolhidos pela AUC de validação: épocas 25 (base) e 10 (enxuta).",
  ];
  notas.forEach((n, i) => {
    const x = L.margem + i * (5.915 + 0.3);
    cartao(pres, s, x, 5.95, 5.915, 1.0);
    texto(s, n, { x: x + 0.25, y: 5.95, w: 5.415, h: 1.0, fontSize: 16, valign: "middle" });
  });
  s.addNotes("As duas redes zeram a perda de treino, ou seja, decoram as imagens de treino. A diferença está na validação: na rede do artigo a perda de validação volta a subir, sinal de sobreajuste; na enxuta quase não sobe. Os círculos marcam a época que o script dos autores guardou.");
}

module.exports = { modificacao, porque, resultados, curvas };
