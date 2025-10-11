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

function getOptionalEnv(varName) {
	return process.env[varName] || null;
}

// Centralized configuration
export default {
  // Required by ALL components
  rabbitmqUrl: validateRequiredEnv('RABBITMQ_URL'),
  redisUrl: validateRequiredEnv('REDIS_URL'),
  
  // Optional - only some components need this
  port: getOptionalEnv('PORT'),
  
  nodeEnv: getOptionalEnv('NODE_ENV'),
  logLevel: getOptionalEnv('LOG_LEVEL'),
  
  nodeId: process.env.NODE_ID || process.env.WORKER_ID || `node-${Date.now()}`,
  
  taskQueue: 'task_queue',
  resultQueue: 'results'
};