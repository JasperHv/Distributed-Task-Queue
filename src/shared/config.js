// Centralized configuration
export default {
  // RabbitMQ connection
  rabbitmqUrl: process.env.RABBITMQ_URL,
  
  // Redis connection
  redisUrl: process.env.REDIS_URL,
  
  // Node identification (NODE_ID for coordinator, WORKER_ID for workers)
  nodeId: process.env.NODE_ID || process.env.WORKER_ID || `node-${Date.now()}`,
  
  // Queue names
  taskQueue: 'task_queue',
  resultQueue: 'results',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};