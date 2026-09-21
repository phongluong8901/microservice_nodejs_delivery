"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const internal_1 = __importDefault(require("./routes/internal"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/internal", internal_1.default);
const server = http_1.default.createServer(app);
// Khởi tạo Socket.io gắn vào server HTTP chung
(0, socket_1.initSocket)(server);
server.listen(process.env.PORT, () => {
    console.log(`Realtime service is running port ${process.env.PORT}`);
});
