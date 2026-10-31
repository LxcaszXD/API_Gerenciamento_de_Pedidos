const TIPOS = Object.freeze(['entrega', 'retirada']);
const PRIORIDADES = Object.freeze(['normal', 'alta']);
const TRANSICOES = Object.freeze({
  recebido: Object.freeze(['em_preparacao', 'cancelado']),
  em_preparacao: Object.freeze(['enviado', 'cancelado']),
  enviado: Object.freeze(['entregue']),
  entregue: Object.freeze([]),
  cancelado: Object.freeze([]),
});
module.exports = { TIPOS, PRIORIDADES, TRANSICOES };
