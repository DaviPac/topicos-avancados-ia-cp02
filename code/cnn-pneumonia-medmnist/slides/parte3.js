// Slides 10-13: qualitativo, discordâncias, limites e conclusão.
const { COR, FONTE, L, texto, titulo, cartao, destaque, imagem } = require("./tema");

function qualitativo(pres) {
  const s = pres.addSlide();
  titulo(s, "Onde cada rede erra");
  imagem(s, "comparacao/matriz_confusao.png", L.margem, 1.3, 7.9, 2.167);
  imagem(s, "comparacao/curva_roc.png", 8.83, 1.3, 3.9, 1.077);
  const notas = [
    "As duas detectam 98% das pneumonias, mas só ~70% dos normais. O viés vem do desbalanceamento do treino, não da arquitetura.",
    "A ROC da enxuta fica acima na região de poucos falsos positivos — é daí que vem a diferença de AUC.",
  ];
  notas.forEach((n, i) => {
    const x = L.margem + i * (5.915 + 0.3);
    cartao(pres, s, x, 5.3, 5.915, 1.6);
    texto(s, n, { x: x + 0.25, y: 5.3, w: 5.415, h: 1.6, fontSize: 16, valign: "middle" });
  });
  s.addNotes("As matrizes de confusão mostram que as duas redes erram do mesmo lado: na dúvida, dizem pneumonia. Isso vem dos dados, com três quartos de pneumonia no treino, e a mudança de arquitetura não mexe nisso. A curva ROC mostra onde a rede enxuta ganha: quando se exige poucos falsos alarmes.");
}

function discordancias(pres) {
  const s = pres.addSlide();
  titulo(s, "As radiografias em que as redes discordam");
  imagem(s, "comparacao/discordancias.png", L.margem, 1.3, 8.9, 1.632);
  const numeros = [
    ["38", "de 624 imagens em que discordam"],
    ["20", "acertos só da enxuta"],
    ["18", "acertos só da base"],
    ["60", "erros das duas, juntas"],
  ];
  numeros.forEach(([n, legenda], i) => {
    const y = 1.3 + i * 1.42;
    texto(s, n, { x: 9.9, y, w: 2.83, h: 0.75, fontFace: FONTE.titulo, fontSize: 36, bold: true, valign: "middle" });
    texto(s, legenda, { x: 9.9, y: y + 0.72, w: 2.83, h: 0.5, fontSize: 14, color: COR.tintaFraca });
  });
  s.addNotes("Olhando imagem por imagem: as duas erram juntas em 60 radiografias e só discordam em 38. Nessas, a enxuta acerta 20 e a base 18. Ou seja, a diferença de acurácia entre as duas é de duas imagens em 624, e por isso a afirmação honesta é que a rede menor não perdeu desempenho.");
}

function limites(pres) {
  const s = pres.addSlide();
  titulo(s, "Limites deste resultado");
  const itens = [
    ["Uma execução de cada", "Sem semente fixa, e a diferença de acurácia é de 2 imagens. A afirmação segura: a rede enxuta não perdeu desempenho."],
    ["Validação ≠ teste", "74,2% de pneumonia na validação, 62,5% no teste. Ajuda a explicar a queda de 96–97% para ~87% de acurácia nas duas redes."],
    ["Especificidade de ~70%", "As duas chutam “pneumonia” na dúvida. Vem do desbalanceamento dos dados; a arquitetura não muda isso."],
    ["28×28 não é clínica", "As radiografias originais chegam a 2.916×2.713 pixels. O objeto de estudo é a arquitetura, não o diagnóstico."],
  ];
  itens.forEach(([lead, corpo], i) => {
    const x = L.margem + (i % 2) * (5.915 + 0.3), y = 1.55 + Math.floor(i / 2) * 2.75;
    cartao(pres, s, x, y, 5.915, 2.5);
    texto(s, lead, { x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.5, fontFace: FONTE.titulo, fontSize: 21, bold: true });
    texto(s, corpo, { x: x + 0.3, y: y + 0.85, w: 5.3, h: 1.45, fontSize: 16 });
  });
  s.addNotes("Vale dizer os limites antes que perguntem. O principal: foi uma execução de cada rede, então não dá para dizer que a enxuta é melhor, só que não é pior. O resto são propriedades dos dados, que as duas redes compartilham.");
}

function conclusao(pres) {
  const s = pres.addSlide();
  s.background = { color: COR.escuro };
  texto(s, "Conclusão", { x: L.margem, y: 0.7, w: 6, h: 0.4, fontSize: 14, color: COR.sobreEscuro, charSpacing: 2 });
  texto(s, "Para o PneumoniaMNIST, a ResNet-18 do artigo é grande demais.",
    { x: L.margem, y: 1.2, w: L.util, h: 1.5, fontFace: FONTE.titulo, fontSize: 38, bold: true, color: COR.branco, valign: "middle" });
  const numeros = [["36×", "menos parâmetros"], ["6,8×", "mais rápida para treinar"], ["0,964", "AUC no teste, contra 0,949"]];
  numeros.forEach(([n, legenda], i) =>
    destaque(pres, s, L.margem + i * (3.8 + 0.365), 3.2, 3.8, 2.4, n, legenda,
      { tamanho: 48, fundo: "1A2A40", corNumero: COR.branco, corLegenda: COR.sobreEscuro }));
  texto(s, "Código, dados, checkpoints e relatório: github.com/DaviPac/topicos-avancados-ia-cp02",
    { x: L.margem, y: 6.3, w: L.util, h: 0.4, fontSize: 14, color: COR.sobreEscuro });
  s.addNotes("Fechar com a frase: o tamanho da rede do artigo não se traduz em ganho de generalização nessa base. Tudo o que foi mostrado está no repositório: código, dataset, os dois checkpoints, os logs de treino e o relatório.");
}

module.exports = { qualitativo, discordancias, limites, conclusao };
