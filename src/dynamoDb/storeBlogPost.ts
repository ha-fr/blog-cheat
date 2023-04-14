import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const storeBlogPost = async (content) => {
  const Item = marshall(content);
  console.log("i => ", Item);

  try {
    const input = {
      TableName: "blog-table",
      Item
    };

    const command = new PutItemCommand(input);

    await client.send(command);
  } catch (e) {
    console.log("create item error => ", e);
    return e;
  }
};

export default storeBlogPost;
