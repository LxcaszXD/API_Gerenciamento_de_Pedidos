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
  // ATUALIZAR
}
module.exports = { PedidosService };
