import morgan from 'morgan';

// Simple morgan logger; can be replaced with pino later
export const requestLogger = morgan('dev');
