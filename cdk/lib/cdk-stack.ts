import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as events from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";

import { Construct } from "constructs";
import { join } from "path";
import {
  GatewayResponse,
  LambdaIntegration,
  ResponseType,
  RestApi
} from "aws-cdk-lib/aws-apigateway";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const retrieveSecretPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["secretsmanager:GetSecretValue"],
      resources: ["arn:aws:secretsmanager:*:*:*:*"]
    });

    const generateBlogPostLambda = new NodejsFunction(
      this,
      "GenerateBlogPostHandler",
      {
        functionName: "generate-blog-post",
        runtime: Runtime.NODEJS_16_X,
        entry: join(__dirname, "../../src/lambdas/generateBlogPost.ts"),
        depsLockFilePath: join(__dirname, "../../package-lock.json"),
        memorySize: 1024,
        bundling: {
          externalModules: [
            "aws-sdk" // Use the 'aws-sdk' available in the Lambda runtime
            //     "axios"
          ]
        },
        timeout: Duration.seconds(300)
      }
    );

    generateBlogPostLambda.role?.attachInlinePolicy(
      new iam.Policy(this, "retrieve-secret", {
        statements: [retrieveSecretPolicy]
      })
    );

    const cronJob = new events.Rule(this, "cronJob", {
      schedule: events.Schedule.rate(Duration.hours(1))
    });

    cronJob.addTarget(new LambdaFunction(generateBlogPostLambda));

    const retrieveBlogPostLambda = new NodejsFunction(
      this,
      "RetrieveBlogPostHandler",
      {
        functionName: "retrieve-blog-post",
        runtime: Runtime.NODEJS_16_X,
        entry: join(__dirname, "../../src/lambdas/getBlogPosts.ts"),
        depsLockFilePath: join(__dirname, "../../package-lock.json"),
        memorySize: 1024,
        bundling: {
          externalModules: [
            "aws-sdk" // Use the 'aws-sdk' available in the Lambda runtime
            //     "axios"
          ]
        }

        // timeout: Duration.seconds(300)
      }
    );

    const blogTable = new Table(this, "BlogTable", {
      tableName: "blog-table",
      partitionKey: { name: "id", type: AttributeType.STRING }
    });

    blogTable.grantFullAccess(generateBlogPostLambda);
    blogTable.grantReadData(retrieveBlogPostLambda);

    const blogApi = new RestApi(this, "BlogApi", {
      restApiName: "blog-api",
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "Origin",
          "x-api-key",
          "access-control-allow-origin"
        ],
        allowOrigins: ["*"],
        allowMethods: ["POST"]
      }
    });

    new GatewayResponse(this, "Default400", {
      restApi: blogApi,
      type: ResponseType.DEFAULT_4XX
    });

    const blogRoot = blogApi.root.addResource("blog");

    blogRoot
      .addResource("getBlogPosts")
      .addMethod("GET", new LambdaIntegration(retrieveBlogPostLambda));

    blogApi.addUsagePlan("blogApiUsagePlan", {
      name: "blog-api-usage-plan",
      throttle: {
        rateLimit: 1,
        burstLimit: 3
      }
    });
  }
}
