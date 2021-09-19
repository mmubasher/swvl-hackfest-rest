#!/bin/bash
set -e
apt-get update
nvm use 8.9.2
npm install
pm2 restart all
