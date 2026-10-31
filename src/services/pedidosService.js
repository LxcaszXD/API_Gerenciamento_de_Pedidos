const { ApiError } = require('../errors/ApiError');
const { validarCriacao, validarId, validarStatus } = require('../validators/pedidoValidator');
const { TRANSICOES } = require('../domain/pedidoRules');
class PedidosService {
  constructor(repository) { this.repository = repository; }
  criar(dados) {
    return this.repository.criar({ ...validarCriacao(dados), status: 'recebido' });
  }
  listar() { return this.repository.listar(); }
  consultar(rawId) {
    const pedido = this.repository.buscar(validarId(rawId));
    if (!pedido) throw new ApiError(404, 'Pedido não encontrado.');
    return pedido;
  }
  atualizarStatus(rawId, dados) {
    const pedido = this.consultar(rawId);
    const status = validarStatus(dados);
    if (!TRANSICOES[pedido.status].includes(status)) {
      throw new ApiError(400, `Transição de ${pedido.status} para ${status} não permitida.`);
    }
    return this.repository.atualizarStatus(pedido.id, status);
  }
}
module.exports = { PedidosService };
