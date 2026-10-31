const express = require('express');
function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
  return app;
}
module.exports = { createApp };
