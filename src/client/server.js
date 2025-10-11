import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import config from '../shared/config.js';

const app = express();

if (!config.port) {
  console.error('ERROR: PORT is required for the client API');
  console.error('Please set PORT in your .env file');
  process.exit(1);
}
const PORT = parseInt(config.port, 10);

app.get('/', (req, res) => {
    res.send('Task Queue API Server is running');
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
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

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});

export default app;