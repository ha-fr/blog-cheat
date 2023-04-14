#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";
require("dotenv").config();

const env = {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: "eu-west-2"
  }
};

const app = new cdk.App();
new CdkStack(app, "CdkStack", env);
