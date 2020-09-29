#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { SecretTraitorStack } from '../lib/secret-traitor-stack';

const app = new cdk.App();
new SecretTraitorStack(app, 'SecretTraitorStack');
