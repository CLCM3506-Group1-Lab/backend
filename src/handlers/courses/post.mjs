import { getDynamodbClient } from '/opt/nodejs/helper.mjs';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const ddbDocClient = getDynamodbClient();

const tableName = process.env.CoursesTable;

export const handler = async (event) => {
  const { id, email, admin } = event.requestContext.authorizer.lambda;

  if (!admin) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Forbidden' })
    };
  }

  const { name, description, price, lecturer, totalHours, numberOfLectures } = JSON.parse(
    event.body
  );

  // check any of them is empty
  if (!name || !description || !price || !lecturer || !totalHours || !numberOfLectures) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'All fields are required' })
    };
  }

  const params = {
    TableName: tableName,
    Item: {
      id: uuidv4(), // generate a unique id for the course
      name,
      description,
      price,
      lecturer,
      totalHours,
      numberOfLectures
    }
  };

  const command = new PutCommand(params);

  try {
    await ddbDocClient.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Course created successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Could not create the course'
    };
  }
};
