#!/bin/bash

NETWORK=lambda-local

function create_network() {
  network=$1
  if docker network inspect ${network} &>/dev/null
  then
    return
  fi
  docker network create ${network}
}

create_network ${NETWORK}
