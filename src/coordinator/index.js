import amqp from "amqplib";
import config from "../shared/config.js";

async function sendMessage() {
    let connection, channel;
    try {
        connection = await amqp.connect(config.rabbitmqUrl, {
            clientProperties: { connection_name: config.nodeId }
        });
        const channel = await connection.createConfirmChannel();
        await channel.assertQueue(config.taskQueue, { durable: true });
        console.log(`Connected to RabbitMQ as ${config.nodeId}`);

        // Send 10 messages
        for (let i = 1; i <= 10; i++) {
            const testMsg = `Message ${i}`;
            await channel.sendToQueue(config.taskQueue, Buffer.from(testMsg), { persistent: true });  
+           await channel.waitForConfirms();  
            console.log(`[${config.nodeId}] Sent: '${testMsg}'`);
        }
        
        console.log("Connection closed successfully");
    } catch (error) {
        console.error("Error in sendMessage:", error);
    } finally {
        if (channel) {
            try {
                await channel.close();
            } catch (closeError) {
                console.error("Error closing channel:", closeError);
            }
        }
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error("Error closing connection:", closeError);
            }
        }
    }
}

sendMessage();
