import { APIGatewayEvent, Context } from "aws-lambda";
import storeBlogPost from "../dynamoDb/storeBlogPost";
import { generateChatGPTResponse } from "../openAI";
import retrieveSingleBlogPost from "../dynamoDb/retrieveSingleBlogPost";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export const handler = async () => {
  const content = await generateChatGPTResponse(
    "Write me a short tech blog post"
  );
  const date = new Date();

  const cheatBlog = await retrieveSingleBlogPost("cheat_blog");

  cheatBlog.body[1] = content;
  cheatBlog.body[2] = `<i><b>This was generated at ${date.getHours()}:${date.getMinutes()} on ${date.toDateString()}</b></i>`;

  await storeBlogPost(cheatBlog);

  return;
};
