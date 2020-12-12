aws dynamodb --endpoint http://localhost:8000 delete-table --table-name Games > /dev/null
docker-compose up db-setup