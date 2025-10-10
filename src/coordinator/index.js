import amqp from "amqplib";
import config from "../shared/config.js";

async function sendMessage() {
    try {
        const connection = await amqp.connect(config.rabbitmqUrl, {
            clientProperties: { connection_name: config.nodeId }
        });
        const channel = await connection.createChannel();
        await channel.assertQueue(config.taskQueue, { durable: true });
        console.log(`Connected to RabbitMQ as ${config.nodeId}`);

        // Send 10 messages
        for (let i = 1; i <= 10; i++) {
            const testMsg = `Message ${i}`;
            channel.sendToQueue(config.taskQueue, Buffer.from(testMsg), { persistent: true });
            console.log(`[${config.nodeId}] Sent: '${testMsg}'`);
        }
        
    } catch (error) {
        console.error("Error in sendMessage:", error);
    }
}

sendMessage();
