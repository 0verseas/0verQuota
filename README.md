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

First of all, git clone https://github.com/0verseas/0verQuota.git than switch folder to 0verQuota/, and do below
  - ``cd 0verQuota/``
    - switch git branch
      - ``sudo git checkout dev``
    - ``sudo cp public/js/env.js.example public/js/env.js``
    - edit public/js/env.js (modify baseUrl)
    - docker build
      - ``sudo docker run -it --rm -v $PWD:/0verQuota -w /0verQuota node:14.16.0 sh -c 'npm install && npm run build'``

Secondly, switch folder to 0verQuota/docker/ and do below
- ``cd docker/``
  - ``sudo cp .env.example .env``
  - edit .env (modify NETWORKS)
  - edit docker-compose.yaml (modify the container's label which "traefik.http.routers.quota.rule=Host(`` `input student's domain name here` ``) && PathPrefix(`` `/quota` ``)")

Finally, did all the above mentioned it after that the last move is docker-compose up
- ``sudo docker-compose up -d``

If want to stop docker-compose
- ``sudo docker-compose down``

## Permission denied SOP
1. use ll check owner group and mode
2. check group with command `groups`
3. if you can not see the owner group and mode switch to super user mode
4. change Permission denied file mode to 664 and directories to 775  Ex:`find . -type d -exec chmod 0775 {} \;`