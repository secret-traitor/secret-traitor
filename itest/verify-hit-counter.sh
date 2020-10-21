#!/usr/bin/env bash

SCRIPT_NAME=verify-hit-counter.sh
URL=$1
if [[ -z ${URL} ]]
then
  echo "Provide URL as the first argument to ${SCRIPT_NAME}"
  echo "No URL provided, exiting"
  exit 1
fi
TEST_PATH=test-path
URL_WITH_PATH=${URL}/${TEST_PATH}
RESPONSE=$(curl ${URL_WITH_PATH})
EXPECTED_RESPONSE="Hello! You requested the path /${TEST_PATH}"
if [[ "${RESPONSE}" != "${EXPECTED_RESPONSE}" ]]
then
  echo "INTEGRATION TEST FAILURE: requested ${URL_WITH_PATH}, expected:"
  echo "${EXPECTED_RESPONSE}"
  echo "received:"
  echo "${RESPONSE}"
  exit 1
fi
exit 0
