import express from "express";
import { createRzaorpayOrder, verifyRazorPayPayment } from "../controllers/payment.js";
const router = express.Router();
router.post("/create", createRzaorpayOrder);
router.post("/verify", verifyRazorPayPayment);
export default router;
