const { Router } = require('express');
const { createPedidosController } = require('../controllers/pedidosController');
function createPedidosRoutes(service) {
  const router = Router();
  const controller = createPedidosController(service);
  router.post('/', controller.criar);
  router.get('/', controller.listar);
  router.get('/:id', controller.consultar);
  router.patch('/:id/status', controller.atualizarStatus);
  return router;
}
module.exports = { createPedidosRoutes };
