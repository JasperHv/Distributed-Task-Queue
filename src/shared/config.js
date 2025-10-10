// Helper function to validate required environment variables
function validateRequiredEnv(varName) {
  const value = process.env[varName];
  
  if (!value) {
    console.error(`ERROR: Required environment variable ${varName} is not set`);
    console.error(`Please set ${varName} in your environment or .env file`);
    process.exit(1);
  }
  
  return value;
}

// Centralized configuration
export default {
  // RabbitMQ connection
  rabbitmqUrl: validateRequiredEnv('RABBITMQ_URL'),
  
  // Redis connection
  redisUrl: validateRequiredEnv('REDIS_URL'),
  
  // Node identification (NODE_ID for coordinator, WORKER_ID for workers)
  nodeId: process.env.NODE_ID || process.env.WORKER_ID || `node-${Date.now()}`,
  
  // Queue names
  taskQueue: 'task_queue',
  resultQueue: 'results',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};