const request = require('supertest');
const { createApp } = require('../src/app');
const { TRANSICOES } = require('../src/domain/pedidoRules');
const valido = { cliente: 'Carlos Silva', tipo: 'entrega', valor: 350, prioridade: 'normal' };
let app;
beforeEach(() => { app = createApp(); });
const criar = (body = valido) => request(app).post('/pedidos').send(body);

describe('Cadastro, listagem e consulta (RF01-RF03)', () => {
  test('lista inicialmente vazia', async () => {
    const res = await request(app).get('/pedidos');
    expect(res.status).toBe(200); expect(res.body).toEqual([]);
  });
  test('cria com ID, Location e status inicial, removendo espaços do cliente', async () => {
    const res = await criar({ ...valido, cliente: '  Carlos Silva  ' });
    expect(res.status).toBe(201); expect(res.headers.location).toBe('/pedidos/1');
    expect(res.body).toEqual({ id: 1, ...valido, status: 'recebido' });
  });
  test('IDs sequenciais e listagem na ordem de cadastro', async () => {
    await criar(); await criar({ ...valido, cliente: 'Ana', tipo: 'retirada', prioridade: 'alta', valor: 0.01 });
    const res = await request(app).get('/pedidos');
    expect(res.status).toBe(200); expect(res.body.map(p => p.id)).toEqual([1, 2]);
    expect(res.body[1]).toMatchObject({ cliente: 'Ana', tipo: 'retirada', prioridade: 'alta', valor: 0.01 });
  });
  test('consulta um pedido existente', async () => {
    const novo = await criar(); const res = await request(app).get('/pedidos/1');
    expect(res.status).toBe(200); expect(res.body).toEqual(novo.body);
  });
  test.each(['999', '9007199254740991'])('ID %s inexistente retorna 404', async id => {
    expect((await request(app).get(`/pedidos/${id}`)).status).toBe(404);
  });
  test.each(['0','-1','1.5','abc','01','1e0','9007199254740992'])('ID %s inválido retorna 400', async id => {
    expect((await request(app).get(`/pedidos/${id}`)).status).toBe(400);
  });
  test('instâncias de aplicação não compartilham pedidos', async () => {
    await criar(); expect((await request(createApp()).get('/pedidos')).body).toEqual([]);
  });
});

describe('Validações não devem gravar dados inválidos', () => {
  const casos = [
    ['cliente ausente', { ...valido, cliente: undefined }],
    ['cliente vazio', { ...valido, cliente: '' }],
    ['cliente só espaços', { ...valido, cliente: ' \t\n ' }],
    ['cliente número', { ...valido, cliente: 12 }],
    ['cliente null', { ...valido, cliente: null }],
    ['valor ausente', { ...valido, valor: undefined }],
    ['valor zero', { ...valido, valor: 0 }],
    ['valor negativo', { ...valido, valor: -1 }],
    ['valor string', { ...valido, valor: '350' }],
    ['valor booleano', { ...valido, valor: true }],
    ['valor null', { ...valido, valor: null }],
    ['tipo ausente', { ...valido, tipo: undefined }],
    ['tipo desconhecido', { ...valido, tipo: 'drone' }],
    ['tipo com caixa diferente', { ...valido, tipo: 'Entrega' }],
    ['prioridade ausente', { ...valido, prioridade: undefined }],
    ['prioridade desconhecida', { ...valido, prioridade: 'urgente' }],
    ['campo desconhecido', { ...valido, desconto: 2 }],
    ['status no cadastro', { ...valido, status: 'entregue' }],
    ['ID no cadastro', { ...valido, id: 98 }],
    ['array', []], ['objeto vazio', {}],
  ];
  test.each(casos)('%s', async (_nome, dados) => {
    const res = await criar(dados);
    expect(res.status).toBe(400); expect(typeof res.body.erro).toBe('string');
    expect((await request(app).get('/pedidos')).body).toEqual([]);
    expect((await criar()).body.id).toBe(1);
  });
  test('corpo ausente retorna 400', async () => {
    const res = await request(app).post('/pedidos'); expect(res.status).toBe(400);
  });
  test('JSON null retorna 400 em JSON', async () => {
    const res = await request(app).post('/pedidos').set('Content-Type','application/json').send('null');
    expect(res.status).toBe(400); expect(res.body.erro).toBeDefined();
  });
  test('número fora da faixa finita retorna 400', async () => {
    const res = await request(app).post('/pedidos').set('Content-Type','application/json')
      .send('{"cliente":"Ana","tipo":"entrega","valor":1e400,"prioridade":"normal"}');
    expect(res.status).toBe(400);
  });
});

describe('Atualização e transições (RF04)', () => {
  const estados = Object.keys(TRANSICOES);
  const caminhos = {
    recebido: [], em_preparacao: ['em_preparacao'], enviado: ['em_preparacao','enviado'],
    entregue: ['em_preparacao','enviado','entregue'], cancelado: ['cancelado'],
  };
  const patch = status => request(app).patch('/pedidos/1/status').send({status});
  test.each(estados.flatMap(origem => estados.map(destino => [origem, destino])))('%s -> %s', async (origem, destino) => {
    await criar();
    for (const estado of caminhos[origem]) expect((await patch(estado)).status).toBe(200);
    const permitida = TRANSICOES[origem].includes(destino);
    const res = await patch(destino);
    expect(res.status).toBe(permitida ? 200 : 400);
    expect((await request(app).get('/pedidos/1')).body.status).toBe(permitida ? destino : origem);
    if (permitida) expect(res.body).toEqual({ id: 1, ...valido, status: destino });
    else expect(res.body.erro).toMatch(/Transição/);
  });
  test.each([{}, {status:'sumiu'}, {status:null}, {status:2}, {status:'toString'},
    {status:'__proto__'}, {status:'cancelado',cliente:'Outro'}, []])('status inválido: %j', async body => {
    await criar(); const res = await request(app).patch('/pedidos/1/status').send(body);
    expect(res.status).toBe(400);
    expect((await request(app).get('/pedidos/1')).body.status).toBe('recebido');
  });
  test('status sem corpo retorna 400', async () => {
    await criar(); expect((await request(app).patch('/pedidos/1/status')).status).toBe(400);
  });
  test('ID inexistente prevalece sobre status inválido', async () => {
    expect((await request(app).patch('/pedidos/999/status').send({status:'sumiu'})).status).toBe(404);
  });
  test('ID malformado no PATCH retorna 400', async () => {
    expect((await request(app).patch('/pedidos/abc/status').send({status:'cancelado'})).status).toBe(400);
  });
});

describe('Erros técnicos', () => {
  test('JSON malformado produz JSON 400', async () => {
    const res = await request(app).post('/pedidos').set('Content-Type','application/json').send('{');
    expect(res.status).toBe(400); expect(res.body).toEqual({erro:'JSON malformado.'});
  });
  test('corpo acima de 16 KiB retorna 413', async () => {
    const res = await criar({...valido, cliente: 'a'.repeat(17000)});
    expect(res.status).toBe(413); expect(res.body.erro).toBeDefined();
  });
  test('rota desconhecida retorna JSON 404', async () => {
    const res = await request(app).get('/inexistente');
    expect(res.status).toBe(404); expect(res.body.erro).toBe('Rota não encontrada.');
  });
  test('falha inesperada retorna 500 sem expor detalhes', async () => {
    const logger = {error: jest.fn()};
    const appComFalha = createApp({repository:{listar(){throw new Error('detalhe privado');}},logger});
    const res = await request(appComFalha).get('/pedidos');
    expect(res.status).toBe(500); expect(res.body).toEqual({erro:'Erro interno do servidor.'});
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
