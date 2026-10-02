import app from './app.js';
import { config } from './config.js';
import { logger } from './logger.js';

app.listen(config.port, () => {
  logger.info(`API iniciada na porta ${config.port}`);
});
