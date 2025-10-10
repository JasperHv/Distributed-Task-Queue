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
                console.log(`Received: ${msg.content.toString()}`);
                channel.ack(msg);
        }, { noAck: false });
}   catch (error) {
        console.error("Error in sendMessage:", error);
    }
}

receiveMessage();
