import express from 'express';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import { config } from './config.js';
import { logger } from './logger.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

const configuredFrontendOrigins = config.frontendUrl.split(',').map((origin) => origin.trim()).filter(Boolean);
const localDevelopmentOrigin = /^https?:\/\/(?:localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}):(5173|5174)$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredFrontendOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && localDevelopmentOrigin.test(origin))) {
      return callback(null, true);
    }

    return callback(new Error('Origem não permitida pelo CORS.'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Sistema de Reservas de Salas API',
    version: '1.0.0',
    description: 'Documentação interativa da API REST para reservas de salas.'
  },
  servers: [{ url: 'http://localhost:4000/api' }]
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js']
});

app.get('/api/health', (req, res) => {
  return res.status(200).json({ success: true, message: 'API funcionando.' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
