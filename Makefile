TEMPLATE_YML=template.yml

watch:
	npm run watch

synth:	aws-prereqs
	npx cdk synth --no-staging > $(TEMPLATE_YML)

start-api:
	bash scripts/start-api.sh

rm-dynamo:
	bash scripts/rm-dynamo.sh

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

build:
	npm run build

tests:
	npm test

start-reverse-proxy:
	

start-frontend:
	cd frontend && npm start