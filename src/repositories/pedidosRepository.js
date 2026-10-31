// Uma instância por aplicação; não expõe referências mutáveis do armazenamento.
class PedidosRepository {
  constructor() {
    this.pedidos = new Map();
    this.proximoId = 1;
  }
  criar(dados) {
    const pedido = { id: this.proximoId++, ...dados };
    this.pedidos.set(pedido.id, pedido);
    return { ...pedido };
  }
  listar() { return Array.from(this.pedidos.values(), (pedido) => ({ ...pedido })); }
  buscar(id) {
    const pedido = this.pedidos.get(id);
    return pedido ? { ...pedido } : null;
  }
  atualizarStatus(id, status) {
    const pedido = this.pedidos.get(id);
    if (!pedido) return null;
    const atualizado = { ...pedido, status };
    this.pedidos.set(id, atualizado);
    return { ...atualizado };
  }
}
module.exports = { PedidosRepository };
