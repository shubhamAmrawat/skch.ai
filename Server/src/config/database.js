import mongoose from 'mongoose';
import logger from './logger.js';
/**
 * MongoDB Connection Configuration
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.DB_URI;

    if (!mongoURI) {
      logger.error('DB_URI not set — server will crash on DB operations');
      process.exit(1);
    }

    // Connection options
    const options = {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      retryWrites: true,
      w: 'majority',
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    logger.info({ 
      host: conn.connection.host,
      database: conn.connection.name 
    }, 'MongoDB connected');

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected — attempting reconnect');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');

    // Exit process with failure if this is initial connection
    process.exit(1);
  }
};

export default connectDB;

