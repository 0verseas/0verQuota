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
Just need to modify related documents(env.js, .env, docker-compose.yaml)

First of all, git clone https://github.com/0verseas/0verQuota.git then switch folder to 0verQuota/, if dev then git clone https://github.com/0verseas/0verQuota.git ./0verQuota-dev/ and do below
  - ``cd ./0verQuota/`` or ``cd ./0verQuota-dev/``
    - switch git branch(if dev then do this step)
      - ``sudo git checkout dev``
    - ``sudo cp public/js/env.js.example public/js/env.js``
    - edit public/js/env.js (modify baseUrl)
    - docker build
      - ``sudo npm run docker-build``
      - if npm command not found then ``npm install``
    - ``sudo cp ./nginx.conf.example ./nginx.conf``
    - edit ./nginx.conf (modify allow 'ips range' based on our environment)
    - ``sudo cp ./realip.conf.example ./realip.conf``
    - edit ./realip.conf (modify set_real_ip_from 'ips range' based on our docker environment)

Secondly, switch folder to 0verQuota/docker/ or 0verQuota-dev/docker/ and do below
- ``cd docker/``
  - ``sudo cp .env.example .env``
  - edit .env (modify NETWORKS, DOMAIN_NAME, ENTRYPOINTS)
  - if you want to exclude IPs other than ours then edit docker-compose.yml open ncnuipwhitlist@file label setting

Finally, did all the above mentioned it after that the last move is docker-compose up
- ``sudo docker-compose up -d``

If want to stop docker-compose
- ``sudo docker-compose down``

If don‘t want to stop container and apply docker-compose edited setting then
- ``sudo docker-compose up --detach``