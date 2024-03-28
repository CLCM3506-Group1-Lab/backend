import { getDynamodbClient } from '/opt/nodejs/helper.mjs';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const ddbDocClient = getDynamodbClient();

const tableName = process.env.CoursesTable;

export const handler = async (event) => {
  // get id from path parameters
  const { id } = event.pathParameters;

  const params = {
    TableName: tableName,
    Key: { id }
  };

  const command = new GetCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // This is a wildcard '*' to allow any origin. In production, you should limit this to your specific domains.
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(data.Item)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Could not fetch the course'
    };
  }
};
