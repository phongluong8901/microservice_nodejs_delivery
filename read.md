1. source
- proj zomato clone
- app deliverfood microservice
https://drive.google.com/file/d/1jdlmcZFb9wPTVJaM0029JrkLubyeTJz9/view

customer, seller, rider, admin

auth, restuanrant, rider, admin, realtime, utils service


2. install
cd proj_1
# --- BE
cd service
--- cd auth
npm init -y
npm i -g typescript
npx tsc --init
npm i express dotenv googleapis jsonwebtoken mongoose axios cors
npm i @types/express @types/dotenv @types/jsonwebtoken @types/cors @types/mongoose 
npm i -D @types/express @types/dotenv @types/jsonwebtoken @types/cors @types/mongoose concurrently
npm i -D typescript

--- cd restaurant
npm init -y
npm i express dotenv multer mongoose axios cors datauri jsonwebtoken
npm i @types/express @types/dotenv @types/multer @types/mongoose @types/axios @types/cors
npm i -D @types/express  @types/jsonwebtoken @types/dotenv @types/multer @types/mongoose @types/axios @types/cors

npm i -D concurrently typescript

tsc



--- cd rider
npm init -y
--- cd admin
npm init -y
--- realtime

--- utils
npm init -y
npm i express dotenv cloudinary
npm i -D @types/express @types/dotenv concurrently typescript
npm i cors
npm i -D @types/cors


# --- FE
cd frontend
npm create vite@latest .

create-vite@9.2.1
Ok to proceed? (y) y 


> npx
> create-vite .

│
◇  Select a framework:
│  React
│
◇  Select a variant:
│  TypeScript
│
◇  Which linter to use?
│  Oxlint
│
◇  Install with npm and start now?
│  Yes
│
◇  Scaffolding project in D:\A_Self_Proj\learn_delivery_food_microservice\proj_1\frontend...
│
◇  Installing dependencies with npm...

- tailwind
https://tailwindcss.com/docs/installation/using-vite

npm install tailwindcss @tailwindcss/vite

npm i react-router-dom axios react-hot-toast
npm i @react-oauth/google
npm i react-icons
npm install lucide-react

npm i leaflet @types/leaflet
npm i react-leaflet


3. run
cd proj_1
# --- BE
cd service
- cd auth
- cd restaurant
- cd utils

npm run build
npm start
npm run dev

# --- FE
cd frontend
npm run dev

4. migrate

5. docker

6. deploy

7. link
- mongo atlat
https://cloud.mongodb.com/v2/6aa90c18451a176500747908#/explorer
- google oauth2.0
https://console.cloud.google.com/auth/clients?project=microservice-nodejs-delivery
- cloudinary
-> nho bat full quyen o API keys de no dung api upload
https://console.cloudinary.com/app/c-772f9c0dead98ae314d09274664e33/assets/