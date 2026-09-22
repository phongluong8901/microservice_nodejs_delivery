import TryCatch from "../middlewares/trycatch.js";
export const addRiderProfile = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            mesasge: "Unauthorized",
        });
    }
});
