import express from 'express';
import { isAdmin, isAuth } from '../middlewares/isAuth.js';
import { getPedingRestaurant, getPendingRiders, verifyRestaurant, verifyRider } from '../controllers/admin.js';

const router = express.Router();

// Restaurant 
router.get("/admin/restaurant/pending", isAuth, isAdmin, getPedingRestaurant);
router.patch("/verify/restaurant/:id", isAuth, isAdmin, verifyRestaurant);

// Rider
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRiders);
router.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);

export default router;