# 0verQuota

## Contributing
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

## Docker 🐳
1. Install [Docker](https://docs.docker.com/engine/install/) & [Docker Compose](https://docs.docker.com/compose/install/)
2. Edit docker compose file: `docker/docker-compose.yaml`
2. `cp docker/.env.example docker/.env` and edit it (if you need).
3. If static file doesn't yet be built, you should build it before running docker.
3. `cd docker && docker-compose up -d`


## Permission denied SOP
1. use ll check owner group and mode
2. check group with command `groups`
3. if you can not see the owner group and mode switch to super user mode
4. change Permission denied file mode to 664 and directories to 775  Ex:`find . -type d -exec chmod 0775 {} \;`