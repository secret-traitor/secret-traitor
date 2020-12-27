#!/bin/bash

# idempotent script to start DynamoDB locally

echo $XX

#	docker run -d -v "$PWD":/$(DB_WD) -p $(DB_PORT):$(DB_PORT_IN_CONTAINER) --network $(LOCAL_NETWORK) --name $(DB_CONTAINER_NAME) $(DB_IMAGE)

# if dynamo is started, exit