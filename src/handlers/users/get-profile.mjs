import { getDynamodbClient } from '/opt/nodejs/helper.mjs';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const ddbDocClient = getDynamodbClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.UsersTable;

export const handler = async (event) => {
  // get id from event decoded by the authorizer
  const { id, email } = event.requestContext.authorizer.lambda;

  // find user details from db using primary key id
  const params = {
    TableName: tableName,
    Key: { id }
  };

  let userData;
  try {
    const result = await ddbDocClient.send(new GetCommand(params));
    userData = result.Item;
  } catch (err) {
    console.log('Error', err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }

  if (!userData) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'User not found' })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ id, email })
  };
};
