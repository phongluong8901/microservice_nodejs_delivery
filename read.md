1. source
- proj zomato clone
- app deliverfood microservice
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
--- cd rider
npm init -y
--- cd admin
npm init -y
--- realtime
--- utils


# --- FE
cd frontend
npm create vite@latest

3. run
cd proj_1
# --- BE
cd service
- cd auth

npm run build
npm start
npm run dev

# --- FE
cd frontend


4. migrate

5. docker

6. deploy

7. link
- mongo atlat
https://cloud.mongodb.com/v2/6aa90c18451a176500747908#/explorer
- google oauth2.0
https://console.cloud.google.com/auth/clients?project=microservice-nodejs-delivery