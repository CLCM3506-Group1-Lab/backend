import { getDynamodbClient } from '/opt/nodejs/helper.mjs';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ddbDocClient = getDynamodbClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.UsersTable;

export const handler = async (event) => {
  // get id from event decoded by the authorizer
  const { id } = event.requestContext.authorizer.lambda;

  const { firstName, lastName, city, country, dateOfBirth } = JSON.parse(event.body);

  // Check if dateOfBirth is a valid date
  const date = new Date(dateOfBirth);
  if (isNaN(date.getTime())) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid Format: dateOfBirth' })
    };
  }

  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression:
      'set firstName = :fn, lastName = :ln, city = :c, country = :co, dateOfBirth = :dob',
    ExpressionAttributeValues: {
      ':fn': firstName,
      ':ln': lastName,
      ':c': city,
      ':co': country,
      ':dob': dateOfBirth
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await ddbDocClient.send(new UpdateCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User updated successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Internal Server Error. Could not update the user'
    };
  }
};
