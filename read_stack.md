# --- lib

# --- stack

# --- more

The application supports multiple roles:
• Customer
• Restaurant (Seller)
• Delivery Partner (Rider)
• Admin (Verification & Management)

The backend is divided into 6 independent microservices:
• Auth Service
• Restaurant Service
• Rider Service
• Admin Service
• Realtime Service (Socket.IO)
• Utils Service (File Uploads & Payments)

For communication between services, RabbitMQ is used as a message broker and is deployed on AWS using Docker.

Real-time features include:
• Live order status updates
• Real-time rider location tracking
• Navigation for riders to delivery locations
• Customers can track the delivery partner live on the map
• Sound notifications for order received and delivery accepted

Payments are handled using two gateways:
• Razorpay (for Indian users)
• Stripe (for global users)

The entire project is dockerized and deployed:
• Backend microservices on Render
• Frontend on Vercel

This project is perfect for developers who want to learn:
• Microservices architecture in Node.js
• Real-time systems using Socket.IO
• Message queues using RabbitMQ
• Payment gateway integration
• Docker & production deployment
• How apps like Zomato work internally

# ---


