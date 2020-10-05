#!/bin/bash

# idemopotent script to start the local dynamo db and the api

# set default values for anything not set in the environment
: ${AWS_PROFILE:=default}
# for generate_template
: ${TEMPLATE_YML:=template.yml} # also used in start_api
# for start_db
: ${DB_PORT:=8000}
: ${DB_PORT_IN_CONTAINER:=8000} # should probably be fixed, since I don't pass this value
                                # into the application code
: ${DB_CONTAINER_NAME:=dynamodb}
: ${DB_WD:=dynamodb_local_db}
: ${LOCAL_NETWORK:=lambda-local} # also use in start_api
: ${DB_IMAGE:=amazon/dynamodb-local}
# for start_api
: ${API_PORT:=3005}

SAM_MODE_SPECIAL_VALUE=local

function template_has_changed() {
  if [[ ! -e ${TEMPLATE_YML} ]]
  then
    return 0
  fi
  diff -q \
    ${TEMPLATE_YML} \
    <(SAM_MODE=${SAM_MODE_SPECIAL_VALUE} cdk --profile=${AWS_PROFILE} synth --no-staging) \
    &> /dev/null
}

function generate_template() {
  SAM_MODE=${SAM_MODE_SPECIAL_VALUE} cdk --profile=${AWS_PROFILE} synth --no-staging > ${TEMPLATE_YML}
}

function db_started() {
  [[ -n $(docker ps --quiet --filter="name=${DB_CONTAINER_NAME}") ]] \
    && echo "database already started, not re-starting it"
}

# The database needs a certain table.
# In production, tables will be created by CloudFormation, but sam local does
# not create the table.
function setup_db() {
  aws --profile=${AWS_PROFILE} dynamodb create-table \
    --table-name Hits \
    --attribute-definitions AttributeName=path,AttributeType=S \
    --key-schema AttributeName=path,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:${DB_PORT}
}

function start_db() {
  docker run -d \
    -v "$PWD":/${DB_WD} \
    -p ${DB_PORT}:${DB_PORT_IN_CONTAINER} \
    --network ${LOCAL_NETWORK} \
    --name ${DB_CONTAINER_NAME} ${DB_IMAGE}
  setup_db
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
echo "Starting the API locally, stop it with Ctrl+C"
start_api

