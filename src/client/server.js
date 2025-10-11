import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import config from '../shared/config.js';

const app = express();
app.use(express.json());

if (!config.port) {
  console.error('ERROR: PORT is required for the client API');
  console.error('Please set PORT in your .env file');
  process.exit(1);
}
const PORT = parseInt(config.port, 10);

app.get('/', (req, res) => {
    res.send('Task Queue API Server is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  // Check if we can reach dependencies
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    dependencies: {
      rabbitmq: 'unknown', // TODO: ping RabbitMQ
      redis: 'unknown'     // TODO: ping Redis
    }
  };
  
  res.status(200).json(health);
});

// Placeholder for task submission endpoint
app.post('/tasks', (req, res) => {
  // TODO: Connect to RabbitMQ
  res.status(501).json({ message: 'Task submission not yet implemented' });
});

// Placeholder for task status endpoint
app.get('/tasks/:taskId', (req, res) => {
  // TODO: Connect to Redis
  const { taskId } = req.params;
  res.status(501).json({ message: 'Task status query not yet implemented', taskId });
});

const server = app.listen(PORT);

// SERVER-LEVEL ERROR HANDLING
server.on('error', (error) => {
  console.error('[Server Error]', error.message);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use`);
    console.error('Try a different port or kill the process using this port');
  } else if (error.code === 'EACCES') {
    console.error(`ERROR: Port ${PORT} requires elevated privileges`);
    console.error('Try using a port > 1024 or run with sudo (not recommended)');
  }
  
  process.exit(1);
});

// SUCCESSFUL STARTUP LOGGING
server.on('listening', () => {
  const address = server.address();
  const actualPort = address.port;
  console.log(`[${config.nodeId}] Client API listening on port ${actualPort}`);
  console.log(`[${config.nodeId}] Environment: ${config.nodeEnv}`);
});

const shutdown = async () => {
  console.log('Shutdown signal received, closing server gracefully...');
  
  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Close external connections
  // TODO: Close RabbitMQ connection
  // TODO: Close Redis connection
  
  // Force exit
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);  // Docker stop command / production
process.on('SIGINT', shutdown);   // Ctrl+C / development

export default app;