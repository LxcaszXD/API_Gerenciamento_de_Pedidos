const { ApiError } = require('../errors/ApiError');
class PedidosService {
  constructor(repository) { this.repository = repository; }
  criar(dados) {
    return this.repository.criar({
      cliente: dados.cliente, tipo: dados.tipo, valor: dados.valor,
      prioridade: dados.prioridade, status: 'recebido',
    });
  }
  consultar(rawId) {
    if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(Number(rawId))) {
      throw new ApiError(400, 'ID deve ser um inteiro positivo seguro.');
    }
    const pedido = this.repository.buscar(Number(rawId));
    if (!pedido) throw new ApiError(404, 'Pedido não encontrado.');
    return pedido;
  }
  listar() { return this.repository.listar(); }
}
module.exports = { PedidosService };
