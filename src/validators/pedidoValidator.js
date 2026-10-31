const { ApiError } = require('../errors/ApiError');
const { TIPOS, PRIORIDADES, TRANSICOES } = require('../domain/pedidoRules');
function objeto(body, permitidos) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Envie um objeto JSON.');
  }
  const extras = Object.keys(body).filter((campo) => !permitidos.includes(campo));
  if (extras.length) throw new ApiError(400, `Campos não permitidos: ${extras.join(', ')}.`);
}
function validarCriacao(body) {
  objeto(body, ['cliente', 'tipo', 'valor', 'prioridade']);
  if (typeof body.cliente !== 'string' || !body.cliente.trim()) {
    throw new ApiError(400, 'Cliente é obrigatório e deve ser um texto não vazio.');
  }
  if (typeof body.valor !== 'number' || !Number.isFinite(body.valor) || body.valor <= 0) {
    throw new ApiError(400, 'Valor deve ser numérico, finito e maior que zero.');
  }
  if (!TIPOS.includes(body.tipo)) throw new ApiError(400, `Tipo deve ser: ${TIPOS.join(', ')}.`);
  if (!PRIORIDADES.includes(body.prioridade)) {
    throw new ApiError(400, `Prioridade deve ser: ${PRIORIDADES.join(', ')}.`);
  }
  return { cliente: body.cliente.trim(), tipo: body.tipo, valor: body.valor, prioridade: body.prioridade };
}
function validarId(rawId) {
  if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(Number(rawId))) {
    throw new ApiError(400, 'ID deve ser um inteiro positivo seguro.');
  }
  return Number(rawId);
}
function validarStatus(body) {
  objeto(body, ['status']);
  if (typeof body.status !== 'string' || !Object.hasOwn(TRANSICOES, body.status)) {
    throw new ApiError(400, `Status deve ser: ${Object.keys(TRANSICOES).join(', ')}.`);
  }
  return body.status;
}
module.exports = { validarCriacao, validarId, validarStatus };
