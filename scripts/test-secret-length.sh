#!/bin/bash

# prove that we can access a secret from the environment when running a
# GitHub Action
echo ${TEST_SECRET} | wc