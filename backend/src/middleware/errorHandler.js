import { logger } from '../logger.js';

export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: 'Recurso não encontrado.'
  });
}

export function errorHandler(error, req, res, next) {
  logger.error({
    err: error,
    method: req.method,
    url: req.originalUrl
  }, 'Erro na requisição');

  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 ? 'Erro interno do servidor.' : error.message;

  return res.status(statusCode).json({
    success: false,
    message,
    code: error.code || 'INTERNAL_ERROR'
  });
}
