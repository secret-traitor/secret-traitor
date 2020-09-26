#!/bin/bash

ENV_FILE=.env
if [[ ! -e ${ENV_FILE} ]]
then
  echo "${ENV_FILE} not found, but secrets are needed, failing"
  exit 1
fi
source ${ENV_FILE}