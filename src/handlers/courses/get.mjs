import { getDynamodbClient } from '/opt/nodejs/helper.mjs';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

const ddbDocClient = getDynamodbClient();

const tableName = process.env.CoursesTable;

export const handler = async (event) => {
  const category = event.queryStringParameters?.category;

  const params = {
    TableName: tableName,
    ...(category &&
      category !== 'all' && {
        FilterExpression: '#category = :category',
        ExpressionAttributeNames: {
          '#category': 'category'
        },
        ExpressionAttributeValues: {
          ':category': category
        }
      })
  };

  const command = new ScanCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // This is a wildcard '*' to allow any origin. In production, you should limit this to your specific domains.
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(data.Items)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Could not fetch the courses'
    };
  }
};
