const express = require('express');
const { PedidosRepository } = require('./repositories/pedidosRepository');
const { PedidosService } = require('./services/pedidosService');
const { createPedidosRoutes } = require('./routes/pedidosRoutes');

function createApp({ repository = new PedidosRepository(), logger = console } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  const service = new PedidosService(repository);
  app.use('/pedidos', createPedidosRoutes(service));
  app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
  
  return app;
}
module.exports = { createApp };
