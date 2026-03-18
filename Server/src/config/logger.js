import pino from 'pino'; 

const isProduction = process.env.NODE_ENV === 'production'; 

const logger = pino({
  // Level: what's the minimum severity to log?
  // In production: 'info' and above (info, warn, error)
  // In development: 'debug' and above (everything)
  level: isProduction ? 'info' : 'debug',

  // In production: pure JSON (fast, machine-readable, searchable)
  // In development: pretty-printed, human-readable
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },

  // Base fields added to every log entry automatically
  base: {
    service: 'sktch-ai-backend',
    env: process.env.NODE_ENV || 'development',
  },
});

export default logger;