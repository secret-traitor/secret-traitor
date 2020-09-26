#!/bin/bash

TF_BIN=tf12
TF_VERSION=v0.12.29

if ! type ${TF_BIN} &>/dev/null
then
  echo "terraform ${TF_VERSION} must be available as ${TF_BIN}, failing"
  exit 1
fi