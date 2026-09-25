// Gera slides/apresentacao.pptx a partir das figuras e números do projeto.
//   npm install pptxgenjs      (uma vez)
//   node slides/gerar_slides.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const p1 = require("./parte1");
const p2 = require("./parte2");
const p3 = require("./parte3");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Menos é mais: enxugando a ResNet-18 do MedMNIST v2";

const ordem = [
  p1.capa, p1.artigo, p1.dados, p1.codigo, p1.parametros,
  p2.modificacao, p2.porque, p2.resultados, p2.curvas,
  p3.qualitativo, p3.discordancias, p3.limites, p3.conclusao,
];
ordem.forEach((fazer) => fazer(pres));

const saida = path.join(__dirname, "apresentacao.pptx");
pres.writeFile({ fileName: saida }).then(() => console.log(saida));
