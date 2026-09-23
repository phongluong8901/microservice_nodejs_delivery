import axios from "axios";
import Rider from "../model/Rider.js";
import { getChanel } from "./rabbitmq.js";
export const startOrderReadyConsumer = async () => {
    const channel = getChanel();
    console.log("Starting to consume from: ", process.env.ORDER_READY_QUEUE);
    channel.consume(process.env.ORDER_READY_QUEUE, async (msg) => {
        if (!msg)
            return;
        try {
            console.log("Received Message", msg.content.toString());
            const event = JSON.parse(msg.content.toString());
            console.log("event type", event.type);
            if (event.type !== "ORDER_READY_FOR_RIDER") {
                console.log("skipping non-order-ready-for-rider event ");
                channel.ack(msg);
                return;
            }
            const { orderId, restaurantId, location, } = event.data;
            console.log("Searching for rider near: ", JSON.stringify(location));
            const riders = await Rider.find({
                isAvailable: true,
                isVerified: true,
                location: {
                    $near: {
                        $geometry: location,
                        $maxDistance: 500,
                    }
                }
            });
            console.log(`Found ${riders.length} nearby riders`);
            if (riders.length === 0) {
                // --- DEBUG: check if ANY riders are available (ignore location) ---
                const allAvailable = await Rider.find({ isAvailable: true, isVerified: true });
                console.log(`[DEBUG] Total available+verified riders (no location filter): ${allAvailable.length}`);
                allAvailable.forEach(r => {
                    console.log(`[DEBUG] Rider userId=${r.userId}, location=${JSON.stringify(r.location)}`);
                });
                console.log("No riders available nearby");
                channel.ack(msg);
                return;
            }
            for (const rider of riders) {
                console.log(`Notifying rider userId: ${rider.userId}`);
                try {
                    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
                        event: "order:available",
                        room: `user:${rider.userId}`,
                        payload: { orderId, restaurantId },
                    }, {
                        headers: {
                            "x-internal-key": process.env.INTERNAL_SERVICE_KEY
                        }
                    });
                    console.log(`Notified rider ${rider.userId} successfully`);
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
                catch (error) {
                    console.error(`Failed to notify rider ${rider.userId}`);
                }
            }
            channel.ack(msg);
            console.log("mesasge acknowledged");
        }
        catch (error) {
            console.log("OrderReady consummer error: ", error);
        }
    });
};
