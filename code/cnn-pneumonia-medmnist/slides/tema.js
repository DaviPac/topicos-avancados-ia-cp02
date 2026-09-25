// Tema visual dos slides: cores, fontes e peças reutilizadas em todos os slides.
// Azul = rede do artigo ("antes"), laranja = rede modificada ("depois") -- as mesmas
// cores das figuras em ../comparacao/, para a cor significar a mesma coisa no deck todo.

const path = require("path");

const COR = {
  escuro: "0F1B2D",       // fundo de capa e conclusão (negatoscópio)
  branco: "FFFFFF",
  tinta: "0B0B0B",
  tintaFraca: "52514E",
  sobreEscuro: "C9D3E0",  // texto secundário sobre fundo escuro
  antes: "2A78D6",
  depois: "EB6834",
  cartao: "F2F4F7",       // fundo sutil de cartões
  grade: "DCDCD8",
};

const FONTE = { titulo: "Cambria", corpo: "Calibri" };

// Canvas LAYOUT_WIDE: 13,333" x 7,5". Margem lateral de 0,6".
const L = { largura: 13.333, altura: 7.5, margem: 0.6, util: 13.333 - 2 * 0.6 };

const PROJETO = path.join(__dirname, "..");
const figura = (relativo) => path.join(PROJETO, relativo);

function texto(slide, conteudo, opcoes) {
  slide.addText(conteudo, Object.assign({
    fontFace: FONTE.corpo, fontSize: 16, color: COR.tinta,
    margin: 0, valign: "top", isTextBox: true,
  }, opcoes));
}

function titulo(slide, conteudo, cor = COR.tinta) {
  texto(slide, conteudo, {
    x: L.margem, y: 0.4, w: L.util, h: 0.8,
    fontFace: FONTE.titulo, fontSize: 34, bold: true, color: cor, valign: "middle",
  });
}

function cartao(pres, slide, x, y, w, h, cor = COR.cartao) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: cor }, line: { color: cor },
  });
}

// Etiqueta "antes"/"depois": o motivo visual que identifica cada rede no deck.
function etiqueta(pres, slide, x, y, qual, w = 1.15) {
  const cor = qual === "antes" ? COR.antes : COR.depois;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h: 0.36, rectRadius: 0.18, fill: { color: cor }, line: { color: cor },
  });
  texto(slide, qual.toUpperCase(), {
    x, y, w, h: 0.36, fontSize: 12, bold: true, color: COR.branco,
    align: "center", valign: "middle", charSpacing: 1,
  });
}

// Cartão com um número grande e uma legenda curta embaixo.
function destaque(pres, slide, x, y, w, h, numero, legenda, opcoes = {}) {
  cartao(pres, slide, x, y, w, h, opcoes.fundo || COR.cartao);
  texto(slide, numero, {
    x: x + 0.3, y: y + 0.25, w: w - 0.6, h: h * 0.5,
    fontFace: FONTE.titulo, fontSize: opcoes.tamanho || 40, bold: true,
    color: opcoes.corNumero || COR.tinta, valign: "middle",
  });
  texto(slide, legenda, {
    x: x + 0.3, y: y + 0.25 + h * 0.5, w: w - 0.6, h: h * 0.5 - 0.4,
    fontSize: 14, color: opcoes.corLegenda || COR.tintaFraca,
  });
}

// Imagem encaixada numa largura, mantendo a proporção original (largura/altura).
function imagem(slide, relativo, x, y, w, razao) {
  slide.addImage({ path: figura(relativo), x, y, w, h: w / razao });
  return y + w / razao;
}

module.exports = { COR, FONTE, L, texto, titulo, cartao, etiqueta, destaque, imagem };
