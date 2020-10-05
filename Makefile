VAR_WITH_DEFAULT="default val"
DB_PORT=8000
DB_PORT_IN_CONTAINER=8000
DB_CONTAINER_NAME=dynamodb
DB_WD=dynamodb_local_db
LOCAL_NETWORK=lambda-local
DB_IMAGE=amazon/dynamodb-local


# experimenting with how make works
say-var:
	echo $(VAR_TO_SAY)

second:
	echo 2nd

greet:
	bash scripts/say-hi.sh

dir-info:
	bash scripts/dir-info.sh

call-other-script:
	bash scripts/call-other-script.sh

say-var-with-default:
	echo $(VAR_WITH_DEFAULT)

say-new-var:
	echo $(NEW_VAR)
	bash scripts/say-new-var.sh

# set up the dependency graph of commands here, each calling an idempotent
# script from scripts/
start:
	bash scripts/start-app.sh

create-dynamo:
	docker run -d -v "$PWD":/$(DB_WD) -p $(DB_PORT):$(DB_PORT_IN_CONTAINER) --network $(LOCAL_NETWORK) --name $(DB_CONTAINER_NAME) $(DB_IMAGE)

rm-dynamo:
	docker stop $(DB_CONTAINER_NAME)
	docker rm $(DB_CONTAINER_NAME)
	echo

r:	run


run:
	echo running
	XX=set-as-env bash scripts/create-dynamo.sh

deploy:
	echo