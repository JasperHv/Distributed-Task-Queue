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
        channel.sendToQueue(queue, Buffer.from(testMsg), { persistent: true });
        console.log(" [coordinator] Sent '%s'", testMsg);
        setInterval(() => {}, 1000);

    } catch (error) {
        console.error("Error in sendMessage:", error);
    }
}

sendMessage();
