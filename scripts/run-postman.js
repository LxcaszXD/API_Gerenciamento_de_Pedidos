const newman = require('newman');
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('../src/app');
const collection = require('../postman/pedidos.postman_collection.json');
const out = path.join(__dirname, '../evidencias/automacao');
fs.mkdirSync(out, { recursive: true });
const server = createApp().listen(0, '127.0.0.1', () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const execucoes = [];
  const runner = newman.run({
    collection, envVar: [{ key: 'base_url', value: base }],
    reporters: ['cli', 'json'],
    reporter: { json: { export: path.join(out, 'newman.json') } },
    timeoutRequest: 5000,
  }, (error, summary) => {
    try {
      fs.writeFileSync(path.join(out, 'requisicoes.json'), JSON.stringify({
        origem: 'Execução real automatizada com Newman; não é captura do Postman.',
        geradoEm: new Date().toISOString(),
        falhas: summary?.run.failures.length ?? 1,
        execucoes,
      }, null, 2) + '\n');
      if (error || summary.run.failures.length) {
        console.error(error || 'A coleção apresentou falhas.'); process.exitCode = 1;
      }
    } finally { server.close(); }
  });
  runner.on('request', (error, args) => {
    if (error) return;
    execucoes.push({
      nome: args.item.name, metodo: args.request.method, url: args.request.url.toString(),
      corpo: args.request.body?.raw || null, http: args.response.code,
      resposta: args.response.stream.toString(),
    });
  });
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
