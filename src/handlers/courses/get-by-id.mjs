import { getDynamodbClient } from '/opt/nodejs/helper.mjs';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

const ddbDocClient = getDynamodbClient();

const tableName = process.env.CoursesTable;

export const handler = async (id) => {
  const params = {
    TableName: tableName,
    Key: { id }
  };

  const command = new ScanCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return {
      statusCode: 200,
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
