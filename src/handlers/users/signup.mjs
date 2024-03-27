import { getDynamodbClient, getJwtConfig } from '/opt/nodejs/helper.mjs';
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
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

  // ensure password length at least 8 characters
  if (password.length < 8) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'password must be at least 8 characters' })
    };
  }

  // find from db if user already exists

  let userData;
  try {
    const result = await ddbDocClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      })
    );
    userData = result.Items[0]; // get the first item
  } catch (err) {
    console.log('Error', err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }

  if (userData) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'User already exists' })
    };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
  const userId = uuidv4();

  var params = {
    TableName: tableName,

    Item: { id: userId, email, password: hashedPassword, salt }
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (err) {
    console.log('Error', err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }

  // generate a JWT token
  const token = jwt.sign({ iss: 'bowvalleycollege', email, id: userId }, jwtSecret, {
    expiresIn: jwtExpiry
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ token })
  };
};
