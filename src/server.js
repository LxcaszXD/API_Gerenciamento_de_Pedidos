const { createApp } = require('./app');
const rawPort = process.env.PORT ?? '3000';
const port = /^\d+$/.test(rawPort) ? Number(rawPort) : NaN;
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT deve ser um inteiro de 1 a 65535.');
}
const server = createApp().listen(port, () => {
  console.log(`API de pedidos: http://localhost:${port}`);
});
server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close());
}
