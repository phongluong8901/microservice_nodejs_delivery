import { getChanel } from "./rabbitmq.js";
export const publishEvent = async (type, data) => {
    const channel = getChanel();
    channel.sendToQueue(process.env.ORDER_READY_QUEUE, Buffer.from(JSON.stringify({ type, data })), { persistent: true });
};
