const { PedidosRepository } = require('../src/repositories/pedidosRepository');
const { createErrorHandler } = require('../src/middlewares/errorHandler');
test('repositório isola os dados das referências devolvidas', () => {
  const repo = new PedidosRepository();
  const pedido = repo.criar({cliente:'Ana',status:'recebido'});
  pedido.cliente = 'Alterado'; repo.listar()[0].status = 'cancelado';
  repo.buscar(1).cliente = 'Outra alteração';
  expect(repo.buscar(1)).toEqual({id:1,cliente:'Ana',status:'recebido'});
  const atualizado = repo.atualizarStatus(1,'em_preparacao'); atualizado.status = 'enviado';
  expect(repo.buscar(1).status).toBe('em_preparacao');
});
test('atualização de ID inexistente retorna null', () => {
  expect(new PedidosRepository().atualizarStatus(99,'cancelado')).toBeNull();
});
test('handler delega erro quando os headers já foram enviados', () => {
  const erro = new Error('falha'); const next = jest.fn();
  createErrorHandler(console)(erro, {}, {headersSent:true}, next);
  expect(next).toHaveBeenCalledWith(erro);
});
