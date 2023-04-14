import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const retrieveSingleBlogPost = async (id) => {
  const input = {
    TableName: "blog-table",
    Key: { id: { S: id } }
  };
  const command = new GetItemCommand(input);
  const { Item } = await client.send(command);

  return unmarshall(Item);
};

export default retrieveSingleBlogPost;
