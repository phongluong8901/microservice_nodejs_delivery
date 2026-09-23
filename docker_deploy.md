1. auth
--- cd auth

docker login

docker build -t tomato-auth .

docker tag tomato-auth phongluong3366/tomato-auth:latest

docker push phongluong3366/tomato-auth:latest


2. restaurant
--- cd restaurant

docker build -t restaurant-service .

docker tag restaurant-service phongluong3366/restaurant-service:latest

docker push phongluong3366/restaurant-service:latest

3. rider
--- cd rider

docker build -t rider-service .

docker tag tomato-rider phongluong3366/tomato-rider:latest

docker push phongluong3366/tomato-rider:latest

4. realtime
--- cd realtime
docker build -t realtime-service .

docker tag tomato-realtime phongluong3366/tomato-realtime:latest

docker push phongluong3366/tomato-realtime:latest

5. admin
--- cd admin
docker build -t admin-service .

docker tag tomato-admin phongluong3366/tomato-admin:latest

docker push phongluong3366/tomato-admin:latest

6. utils
--- cd utils
docker build -t utils-service .

docker tag tomato-utils phongluong3366/tomato-utils:latest

docker push phongluong3366/tomato-utils:latest




