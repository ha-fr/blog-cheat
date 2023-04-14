import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { awsConfig } from "../../awsConfig";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: awsConfig.region });

const retrieveBlogPosts = async () => {
  const input = {
    TableName: "blog-table"
  };

  const command = new ScanCommand(input);
  const { Items } = await client.send(command);

  const posts = [];

  Items.forEach((i) => {
    posts.push(unmarshall(i));
  });

  return posts;
};

export default retrieveBlogPosts;
