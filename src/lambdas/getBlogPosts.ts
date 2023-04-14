import { APIGatewayEvent, Context } from "aws-lambda";
import { APIGateway } from "aws-sdk";
import retrieveBlogPosts from "../dynamoDb/retrieveBlogPosts";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export const handler = async () => {
  const blogposts = await retrieveBlogPosts();

  return {
    statusCode: 200,
    body: JSON.stringify({ blogposts }),
    headers: {
      "Access-Control-Allow-Headers": "Content-Type,Origin,x-api-key",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Origin": "*", // make this 'localhost' and cloudfront distribution after
      "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
    }
  };
};
