import express from 'express';
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import { assignRiderToOrder, createOrder, fetchOrderForPayment, fetchRestaurantOrders, fetchSingleOrder, getCurrentOrderForRider, getMyOrders, updatedOrderStatusRider, updateOrderStatus } from '../controllers/order.js';

const router = express.Router();

router.post("/new", isAuth, createOrder);

// ⚠️ Specific routes MUST come BEFORE wildcard routes like /:orderId
router.post("/assign/rider", assignRiderToOrder);           // called by rider service (internal)
router.get("/current/rider", getCurrentOrderForRider);      // called by rider service (internal)
router.put("/update/status/rider", updatedOrderStatusRider); // called by rider service (internal)

router.get("/myorder", isAuth, getMyOrders);
router.get("/my", isAuth, getMyOrders);
router.get("/payment/:id", fetchOrderForPayment);
router.get("/all/:restaurantId", isAuth, isSeller, fetchRestaurantOrders);
router.get("/restaurant/:restaurantId", isAuth, isSeller, fetchRestaurantOrders);

// Wildcard routes LAST
router.get("/:id", isAuth, fetchSingleOrder);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);

export default router;