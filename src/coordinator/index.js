import amqp from "amqplib";
import config from "../shared/config.js";

async function sendMessage() {
    try {
        const connection = await amqp.connect(config.rabbitmqUrl);
        const channel = await connection.createChannel();
        const queue = "task_queue";
        const testMsg = "Hello World!";
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(testMsg), { persistent: true });
        console.log(" [coordinator] Sent '%s'", testMsg);
        setInterval(() => {}, 1000);

    } catch (error) {
        console.error("Error in sendMessage:", error);
    }
}

sendMessage();
