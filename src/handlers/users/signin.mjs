import { getDynamodbClient, getJwtConfig } from '/opt/nodejs/helper.mjs';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ddbDocClient = getDynamodbClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.UsersTable;
const { jwtSecret, jwtExpiry } = getJwtConfig();

export const handler = async (event) => {
  // get email and password from request payload
  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'email and password are required' })
    };
  }

  const params = {
    TableName: tableName,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };

  let userData;
  try {
    const result = await ddbDocClient.send(new ScanCommand(params));
    userData = result.Items[0]; // get the first item
  } catch (err) {
    console.log('Error', err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }

  if (!userData) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid email or password' })
    };
  }

  const hashedPassword = crypto
    .pbkdf2Sync(password, userData.salt, 310000, 32, 'sha256')
    .toString('hex');

  if (hashedPassword !== userData.password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid email or password' })
    };
  }

  // generate a JWT token
  const token = jwt.sign({ iss: 'bowvalleycollege', email, id: userData.id }, jwtSecret, {
    expiresIn: jwtExpiry
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ token })
  };
};
