import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { corsMiddleware } from './middlewares/cors.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global middlewares
app.use(express.json());
app.use(corsMiddleware);
app.use(requestLogger);

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/', routes);

// Not found & error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
