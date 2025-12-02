import express from 'express';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { corsMiddleware } from './middlewares/cors.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Global middlewares
app.use(express.json());
app.use(corsMiddleware);
app.use(requestLogger);

// Routes
app.use('/', routes);

// Not found & error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
