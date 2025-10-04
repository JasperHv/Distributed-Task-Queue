// Centralized configuration
export default {
    // RabbitMQ
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://user:pass@localhost:5672',
  
    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
    // Other configurations can be added here
};