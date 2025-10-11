// Helper function to validate required environment variables
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root explicitly
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
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
  
  // API Server
  port: validateRequiredEnv('PORT'),
  nodeEnv: validateRequiredEnv('NODE_ENV'),
  // Node identification (NODE_ID for coordinator, WORKER_ID for workers)
  nodeId: process.env.NODE_ID || process.env.WORKER_ID || `node-${Date.now()}`,
  
  // Queue names
  taskQueue: 'task_queue',
  resultQueue: 'results',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};