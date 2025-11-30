import mongoose from 'mongoose';

/**
 * MongoDB Connection Configuration
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.DB_URI;

    if (!mongoURI) {
      console.error('❌ DB_URI is not defined in environment variables');
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

    console.log(`
╔═══════════════════════════════════════════════════════╗
║  📦 MongoDB Connected                                 ║
║  Host: ${conn.connection.host.padEnd(45)}║
║  Database: ${conn.connection.name.padEnd(41)}║
╚═══════════════════════════════════════════════════════╝
    `);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    // Exit process with failure if this is initial connection
    process.exit(1);
  }
};

export default connectDB;

