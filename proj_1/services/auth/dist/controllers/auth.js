import User from "../model/User.js";
import jwt from 'jsonwebtoken';
import TryCatch from "../middlewares/trycatch.js";
export const loginUser = TryCatch(async (req, res) => {
    try {
        const { email, name, picture } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                image: picture,
            });
        }
        const token = jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: "15d",
        });
        res.status(200).json({
            message: "Logged Success",
            token,
            user
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
