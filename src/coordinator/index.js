import 'dotenv';
import amqp from "amqplib";

async function sendMessage() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
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
