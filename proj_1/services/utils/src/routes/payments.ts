import express from "express";
import { createRzaorpayOrder, payWithStripe, verifyRazorPayPayment, verifyStripe } from "../controllers/payment.js";

const router = express.Router();

router.post("/create", createRzaorpayOrder);
router.post("/verify", verifyRazorPayPayment);
router.post("/stripe/create", payWithStripe);
router.post("/stripe/verify", verifyStripe);

export default router;