#!/bin/bash

aws dynamodb create-table --endpoint-url http://localhost:8000 --table-name UsersTable --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=2,WriteCapacityUnits=2
aws dynamodb create-table --endpoint-url http://localhost:8000 --table-name CoursesTable --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=2,WriteCapacityUnits=2
aws dynamodb create-table --endpoint-url http://localhost:8000 --table-name PurchasesTable --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=2,WriteCapacityUnits=2