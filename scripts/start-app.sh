#!/bin/bash

# idemopotent script to start the local dynamo db and the api

# set default values for anything not set in the environment
: ${AWS_PROFILE:=default}
# for generate_template
: ${TEMPLATE_YML:=template.yml} # also used in start_api
# for start_db
: ${DB_PORT:=8000}
: ${DB_PORT_IN_CONTAINER:=8000}
: ${DB_CONTAINER_NAME:=dynamodb}
: ${DB_WD:=dynamodb_local_db}
: ${LOCAL_NETWORK:=lambda-local} # also use in start_api
: ${DB_IMAGE:=amazon/dynamodb-local}
# for start_api
: ${API_PORT:=3005}

function template_has_changed() {
  if [[ ! -e ${TEMPLATE_YML} ]]
  then
    return 0
  fi
  diff -q \
    ${TEMPLATE_YML} \
    <(cdk --profile=${AWS_PROFILE} synth --no-staging) \
    &> /dev/null
}

function generate_template() {
  cdk --profile=${AWS_PROFILE} synth --no-staging > ${TEMPLATE_YML}
}

function db_started() {
  [[ -n $(docker ps --quiet --filter="name=${DB_CONTAINER_NAME}") ]] \
    && echo "database already started, not re-starting it"
}

function start_db() {
  docker run -d \
    -v "$PWD":/${DB_WD} \
    -p ${DB_PORT}:${DB_PORT_IN_CONTAINER} \
    --network ${LOCAL_NETWORK} \
    --name ${DB_CONTAINER_NAME} ${DB_IMAGE}
}

function start_api() {
  AWS_PROFILE=${AWS_PROFILE} sam local start-api \
    --port=${API_PORT} \
    --template ${TEMPLATE_YML} \
    --docker-network ${LOCAL_NETWORK}
}



# make the template
template_has_changed || generate_template

# start the database
db_started || start_db

# start the api; this will fail if it's already started
start_api

