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

3. run
cd proj_1
# --- BE
cd service

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
