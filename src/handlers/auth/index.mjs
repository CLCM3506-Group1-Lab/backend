import jwt from 'jsonwebtoken';

import { getJwtConfig } from '/opt/nodejs/helper.mjs';
const { jwtSecret } = getJwtConfig();

export const handler = async (event) => {
  if (event.headers.Authorization && event.headers.Authorization.startsWith('Bearer ')) {
    const token = event.headers.Authorization.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    const { id, email } = decoded;

    return {
      principalId: id, // The principal user identification associated with the token sent by the client.
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.routeArn
          }
        ]
      },
      context: {
        id,
        email
      }
    };
  } else {
    console.log('denied');
    return {
      principalId: 'anonymous',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.routeArn
          }
        ]
      },
      context: {}
    };
  }
};
