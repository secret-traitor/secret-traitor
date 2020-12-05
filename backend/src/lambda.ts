'use strict'

const awsServerlessExpress = require('aws-serverless-express')
const app = require('./index')
const server = awsServerlessExpress.createServer(app)

exports.handler = (event: any, context: any) =>
    awsServerlessExpress.proxy(server, event, context)
