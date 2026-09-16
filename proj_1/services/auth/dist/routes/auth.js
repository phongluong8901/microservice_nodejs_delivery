import express from 'express';
import { addUserRole, loginUser, myProfile } from '../controllers/auth.js';
import { isAuth } from '../middlewares/isAuth.js';
const router = express.Router();
router.post("/login", loginUser);
router.put("/add/role", isAuth, addUserRole); // Định nghĩa route PUT tại đường dẫn "/add/role", phải đi qua middleware isAuth trước rồi mới gọi hàm addUserRole
router.get("/me", isAuth, myProfile);
export default router;
