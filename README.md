# API de Gerenciamento de Pedidos

Projeto prático de Tópicos Avançados em Sistemas de Informação II.
Desenvolvemos uma API REST em JavaScript, Node.js e Express, com arquitetura em
camadas, armazenamento em memória, validação e testes automatizados.

## Instalação e execução

Requer Node.js 22 ou superior e npm. No Windows, execute os comandos no
PowerShell dentro da pasta do projeto:

```sh
npm install
npm start
```

A API fica disponível em `http://localhost:3000`. Encerre com Ctrl+C.
`npm run dev` reinicia o servidor ao editar arquivos. Não há banco de dados nem
configuração de senha. Para usar outra porta, no PowerShell:
`$env:PORT="3001"; npm start`; no Bash: `PORT=3001 npm start`. No Postman, ajuste
`base_url` para a mesma porta.

**Os dados são voláteis:** reiniciar o processo apaga todos os pedidos e reinicia
os IDs em 1. O projeto é acadêmico, sem autenticação, e deve ser executado
localmente.

## Rotas e exemplos

| Método | Rota | Sucesso | Erros previstos |
|---|---|---|---|
| POST | /pedidos | 201 + Location | 400 |
| GET | /pedidos | 200 (array, inclusive vazio) | 500 inesperado |
| GET | /pedidos/:id | 200 | 400 ID inválido, 404 inexistente |
| PATCH | /pedidos/:id/status | 200 | 400 dados/transição/ID, 404 inexistente |

Envie `Content-Type: application/json` em POST e PATCH.

POST /pedidos:
```json
{"cliente":"Carlos Silva","tipo":"entrega","valor":350,"prioridade":"normal"}
```
Resposta 201 (o ID muda conforme os cadastros):
```json
{"id":1,"cliente":"Carlos Silva","tipo":"entrega","valor":350,"prioridade":"normal","status":"recebido"}
```

GET /pedidos retorna um array desses objetos. GET /pedidos/1 retorna um objeto.

PATCH /pedidos/1/status:
```json
{"status":"cancelado"}
```
Resposta 200:
```json
{"id":1,"cliente":"Carlos Silva","tipo":"entrega","valor":350,"prioridade":"normal","status":"cancelado"}
```

Exemplo de erro 400 para cliente vazio:
```json
{"erro":"Cliente é obrigatório e deve ser um texto não vazio."}
```
Exemplo de erro 404:
```json
{"erro":"Pedido não encontrado."}
```
JSON malformado retorna 400. Corpo maior que 16 KiB retorna 413. Rota desconhecida
retorna 404 JSON. Falha inesperada retorna 500 com mensagem genérica, e o erro
completo é registrado no servidor.

## Testes Jest e Postman

```sh
npm test
npm run test:coverage
npm run test:postman
```

Os testes com Jest e Supertest cobrem os quatro requisitos funcionais, todas as
combinações de transição de status, entradas inválidas, IDs, JSON malformado,
limite de corpo e falha 500.

O terceiro comando usa o Newman para executar a coleção Postman em uma instância
temporária da API, sem precisar de `npm start`. A coleção e o ambiente estão em
`postman/` e podem ser importados no Postman para testes manuais. Os prints dos
testes realizados no Postman estão em `evidencias/`.

O GitHub Actions executa a instalação, a cobertura e a coleção a cada push ou
pull request.

## Uso de IA

Utilizamos ferramentas de IA como apoio durante o desenvolvimento e a
documentação do projeto.
