import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

function getDynamodbClient() {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.LOCAL ? 'http://dynamodb-local:8000' : undefined
  });

  return DynamoDBDocumentClient.from(client);
}

function getJwtConfig() {
  const jwtSecret = process.env.JWT_SECRET || 'mysecret';
  const jwtExpiry = process.env.JWT_EXPIRY || '12h';
  return { jwtSecret, jwtExpiry };
}

export { getDynamodbClient, getJwtConfig };
