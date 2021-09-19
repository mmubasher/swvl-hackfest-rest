# REST RemoteBaseHQ Hackathon Server

### Project Requirements

- OS: Linux (recommended) or Windows
- Arch: Any
- Nginx
 
### Conventions

- All file and folder names must be in **snake_case**.
- All variable names must be in **camelCase**.
- Developer must adhere to .editorconfig and .eslintrc.json configurations, to have a consistent coding standard.

### Description

This is an API server for REST RemoteBaseHQ Hackathon  

### Installation

Presence requires [Node.js](https://nodejs.org/) v6+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ npm install
```

### Configuration 

Before running, ensure .env exists at application's root path. Update .env to use latest environment values if you want to use different settings.

### Run

This application can be started through index.js.
```sh
$ npm start 
```

### Plugins

Following major plugins are used to extend Presence

|Plugin|Usage| 
--------|----------------- 
|good|logger tool|
|Hapi|NodeJS framework|
|Socket.IO|REAL-TIME ENGINE|
|Joi|Request validation|
|Swagger|Documentation

### Nvm Installation

Install a C++ Compiler

```sh
$ apt-get update
$ apt-get install build-essential libssl-dev
```
Visit [nvm latest](https://github.com/creationix/nvm/releases) for latest release version of NVM
```
$ curl https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
$ source ~/.profile
$ nvm --version
```

### Node Installation
```
$ nvm install v6.8
$ nvm use v6.8
```

#Server Code Running management:
```
	Server using the pm2 to run the code on the server
	pm2 list  (to see the processes running)
	pm2 restart all (to restart all the processes)
	pm2 reset all (to reset the restart counter)
	pm2 stop/start xyz (to stop/start particular app) 
	pm2 restart app (to start the specific app)
```
