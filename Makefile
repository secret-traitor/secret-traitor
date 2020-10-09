VAR_WITH_DEFAULT="default val"
DB_PORT=8000
DB_PORT_IN_CONTAINER=8000
DB_CONTAINER_NAME=dynamodb
DB_WD=dynamodb_local_db
LOCAL_NETWORK=lambda-local
DB_IMAGE=amazon/dynamodb-local


start-api:
	bash scripts/start-api.sh

create-dynamo:
	docker run -d -v "$PWD":/$(DB_WD) -p $(DB_PORT):$(DB_PORT_IN_CONTAINER) --network $(LOCAL_NETWORK) --name $(DB_CONTAINER_NAME) $(DB_IMAGE)

rm-dynamo:
	bash scripts/rm-dynamo.sh

r:	run

test-secret-length:
	bash scripts/test-secret-length.sh

run:
	echo running
	XX=set-as-env bash scripts/create-dynamo.sh

aws-prereqs:
	bash scripts/aws-prereqs.sh

bootstrap:	aws-prereqs
	npx cdk bootstrap

diff:	bootstrap
	npx cdk diff

deploy:	bootstrap
	npx cdk deploy --require-approval never

install:
	npm install

tests:
	npm test
