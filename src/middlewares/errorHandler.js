const { ApiError } = require('../errors/ApiError');
function createErrorHandler(logger) {
  return (error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof ApiError) return res.status(error.status).json({ erro: error.message });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON malformado.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ erro: 'Corpo excede o limite de 16 KiB.' });
    logger.error(error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  };
}
module.exports = { createErrorHandler };
