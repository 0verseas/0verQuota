# 0verQuota

## Deploy Local Develop Environment
### Install Dependencies
```
git clone https://github.com/0verseas/0verQuota.git
cd 0verQuota
npm install
```
### Setup
```
cp public/js/env.js.example public/js/env.js
```
edit the config file in `public/js/env.js`

### Testing
```
$ npm run serve
```

### Building
```
$ npm run build
```

## Deploy Docker Develop Environment
### Startup Preparation
if dev then
```
git clone https://github.com/0verseas/0verQuota.git ./0verQuota-dev/
cd ./0verQuota-dev/
git checkout dev
```
if official then
```
git clone https://github.com/0verseas/0verQuota.git
cd ./0verQuota/
```

```
npm install
cp ./public/js/env.js.example ./public/js/env.js
cp ./docker/.env.example ./docker/.env
cp ./docker/nginx.conf.example ./docker/nginx.conf
cp ./docker/realip.conf.example ./docker/realip.conf
```
#### Edit Config Files
modify baseUrl
```
vim ./public/js/env.js
```
modfiy NETWORKS, DOMAIN_NAME, ENTRYPOINTS
*If dev then modfiy COMPOSE_PROJECT_NAME and CONTAINER_NAME*
```
vim ./docker/.env
```
#### *If need container one of the pages exclude IPs other than ours*
modify set_real_ip_from 'IPs range' based on our docker environment and uncomment rows of 32-34
```
vim ./docker/realip.conf
```
modify allow 'IPs range' based on our environment and uncomment allow 'IPs range' and deny all
*if need URL Directory turn to show the error page then add uncomment row 11 'return 403'*
```
vim ./docker/nginx.conf
```
#### *If want Container Block Exclude IPs Other than Ours*
modify uncomment row 30
```
vim ./docker/docker-compose.yaml
```
### Build
```
sudo npm run docker-build
```
### StartUp
*at ./docker/ path*
```
sudo docker-compose up -d
```
### Stop
*at ./docker/ path*
```
sudo docker-compose down
```
### ✨Nonstop Container and Apply New Edit Docker-Compose Setting (Use Only Container is running)✨
The command will not effect on the running container if you have not edited any of the settings on docker-compose.yaml
*at ./docker/ path*
```
sudo docker-compose up --detach
```