import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    image: String,
    role: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});
const User = mongoose.model("User", schema);
export default User;
