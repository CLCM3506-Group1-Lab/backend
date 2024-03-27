import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'mysecret';
const jwtExpiry = process.env.JWT_EXPIRY || '12h';

const ADMIN_EMAIL = ['z.fu177@mybvc.ca'];

function getDynamodbClient() {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.LOCAL ? 'http://dynamodb-local:8000' : undefined
  });

  return DynamoDBDocumentClient.from(client);
}

function getToken({ email, id }) {
  return jwt.sign(
    { iss: 'bowvalleycollege', email, id, admin: ADMIN_EMAIL.includes(email) },
    jwtSecret,
    {
      expiresIn: jwtExpiry
    }
  );
}

function getJwtConfig() {
  return { jwtSecret, jwtExpiry };
}

export { getDynamodbClient, ADMIN_EMAIL, getToken, getJwtConfig };
