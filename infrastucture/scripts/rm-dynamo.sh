#!/bin/bash

# idemopotent script to start the local dynamo db and the api

# set the default values if it's not set in the environment
: ${DB_CONTAINER_NAME:=dynamodb}

if [[ -n $(docker ps --quiet --filter="name=${DB_CONTAINER_NAME}") ]]
then
  docker stop ${DB_CONTAINER_NAME}
else
  echo "container ${DB_CONTAINER_NAME} not running"
fi

if [[ -n $(docker ps -a --quiet --filter="name=${DB_CONTAINER_NAME}") ]]
then
  docker rm ${DB_CONTAINER_NAME}
  echo "container ${DB_CONTAINER_NAME} removed"
else
  echo "container ${DB_CONTAINER_NAME} does not exist, done"
fi