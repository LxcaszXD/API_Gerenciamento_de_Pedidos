function createPedidosController(service) {
  return {
    criar(req, res) {
      const pedido = service.criar(req.body);
      res.location(`/pedidos/${pedido.id}`).status(201).json(pedido);
    },
    listar(_req, res) { res.json(service.listar()); },
    consultar(req, res) { res.json(service.consultar(req.params.id)); },
    atualizarStatus(req, res) { res.json(service.atualizarStatus(req.params.id, req.body)); },
  };
}
module.exports = { createPedidosController };
