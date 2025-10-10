import amqp from "amqplib";
import config from "../shared/config.js";

async function receiveMessage() {
    try {
        const connection = await amqp.connect(config.rabbitmqUrl, {
            clientProperties: {
                connection_name: config.nodeId
            }
        });
        const channel = await connection.createChannel();
        await channel.assertQueue(config.taskQueue, { durable: true });
        console.log(`Connected to RabbitMQ as ${config.nodeId}`);
        console.log(`Waiting for messages in ${config.taskQueue}...`);

        channel.consume(config.taskQueue, (msg) => {
                if (msg === null) {
                    console.warn("Consumer cancelled by server");
                    return;
                }
                try {
                    // Process the message
                    console.log(`[${config.nodeId}] Received: ${msg.content.toString()}`);
                    
                    // Acknowledge after processing
                    channel.ack(msg);
                } catch (processError) {
                    console.error("Error processing message:", processError);
                    channel.nack(msg, false, true); // Reject and requeue
                }
        }, { noAck: false });
    }   catch (error) {
            console.error("Error in receiveMessage:", error);
        }
}

receiveMessage();
