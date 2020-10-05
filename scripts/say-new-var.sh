#!/bin/bash

# If an env var is exported in the environment that make is run from, will a
# script called by make receive the value?
# Yes.

: ${NEW_VAR:=default_val}

echo "NEW_VAR: ${NEW_VAR}"
