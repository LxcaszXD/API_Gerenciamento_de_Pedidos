class PedidosService {
  constructor(repository) { this.repository = repository; }
  criar(dados) {
    return this.repository.criar({
      cliente: dados.cliente, tipo: dados.tipo, valor: dados.valor,
      prioridade: dados.prioridade, status: 'recebido',
    });
  }
  listar() { return this.repository.listar(); }
}
module.exports = { PedidosService };
