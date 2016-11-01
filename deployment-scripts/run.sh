#!/bin/bash

# A simple run script for the proj-mgmt-sys Docker image
# usage: ./run.sh <TAG> <PORT> <CONFIG_PATH> <LOG_DIR>

TAG=$1
PORT=$2
CONFIG_PATH=$3
LOG_DIR=$4

set -x

docker run -itd -v $CONFIG_PATH:/etc/config.json -v $LOG_DIR:/var/log/app/ -p 127.0.0.1:$PORT:8080 --name proj-mgmt-sys proj-mgmt-sys:$TAG
