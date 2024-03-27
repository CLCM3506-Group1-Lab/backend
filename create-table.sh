#!/bin/bash


function dropTable(){
  aws dynamodb delete-table --endpoint-url http://localhost:8000 --table-name UsersTable
  aws dynamodb delete-table --endpoint-url http://localhost:8000 --table-name CoursesTable
  aws dynamodb delete-table --endpoint-url http://localhost:8000 --table-name PurchasesTable
}

function createTable(){
  aws dynamodb create-table --endpoint-url http://localhost:8000 --table-name UsersTable \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=email,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=2,WriteCapacityUnits=2 \
  --global-secondary-indexes IndexName=EmailIndex,KeySchema=["{AttributeName=email,KeyType=HASH}"],Projection="{ProjectionType=ALL}",ProvisionedThroughput="{ReadCapacityUnits=2,WriteCapacityUnits=2}"

  aws dynamodb create-table --endpoint-url http://localhost:8000 --table-name CoursesTable --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=2,WriteCapacityUnits=2
  
  aws dynamodb create-table --endpoint-url http://localhost:8000 --table-name PurchasesTable \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=2,WriteCapacityUnits=2 \
  --global-secondary-indexes IndexName=UserIdIndex,KeySchema=["{AttributeName=userId,KeyType=HASH}"],Projection="{ProjectionType=ALL}",ProvisionedThroughput="{ReadCapacityUnits=2,WriteCapacityUnits=2}"
}

main(){
  if [ "$1" == "-f" ]; then
    dropTable
  fi
  createTable
}

main $1

