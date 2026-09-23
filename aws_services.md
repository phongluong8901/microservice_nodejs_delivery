1. tao EC2
launch an instance
Name
instance type
keypair login (create key pair)
launch

2. connect ec2
update co ubuntu
install docker
enable and start docker service

give cueernt user permission ti run docker commands
pull and run Rabbitmq container with managemet UI

3. Edit inbopund rules
add rule custom tcp, ssh, (5672, 15672)

4. test thong ra internet cua rabbitMQ admin

5. change Rabbitmq local sang public

6. vao render de deploy auth service

7. add cac env vao render

8. thay cac link trong FE (main.tsx) thanh cac public link
https://tomato-auth.onrender.com

9. tuong tu deploy restauran-service len render

=> aws dung cho rabbitMQ (lay link public)
cac BE service deploy len render (thay doi .env rabbitmq va cho vao security cua render)
Fe thi thay cac link local sang link dc public tren render
.env thi dua vao security cua render

10. FE thi deploy len vercel, env thi nhap vao security cua vercel
cac link public (main.ts) thi cu de o ben trong code, khong sao ca

11. vao lai render de sua cac .env security cua FE dc deploy public tren vercel

12. vao Google Aouth2.0 tao lai key URI theo link puvlic moi
-> vao render update lai .env cua auth-service
