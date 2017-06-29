import {FunctionManager} from "./FunctionManager";
import {FuncRequestBuilder} from "./FuncRequestBuilder";
const express = require("express");
const path = require("path");


const tsFormat = () => (new Date()).toLocaleTimeString();

const winston = require('winston');
const logFile = path.join(__dirname, "funclitelogs.log");
const logger = new (winston.Logger)(
{
    transports:[
            new (winston.transports.Console)({colorize: true}),
            new (winston.transports.File)({ filename: logFile, timestamp: tsFormat, level: 'info' })     ]
    });

let processEnv = process.env as any;
var port = processEnv.port || 1337;
var functionsRoot = processEnv.FUNCTIONS_ROOT || path.join(__dirname, "FuncRoot");

var home = processEnv.HOME || path.join(__dirname, "Home");

class FuncLiteServer {

    private server;
    private functionManger;
    private functionsRoot;

    constructor() {
        this.functionsRoot = functionsRoot;
        this.server = express();
        this.server.get("/", (request, response) => {this.warmup(request, response);});
        this.server.post("/api/function/:funcName", (request, response) => {
            this.invokeFunction(request, response);
        });

      // respond to ping from functions portal
        this.server.post("/admin/host/ping", (request, response) => { this.respondToPing(request, response); });
    }

    respondToPing(request, response) {
      logger.info("Responding to ping");
      response.sendStatus(200);
    }

    warmup(request, response) {
        logger.info(`Your function app is up and running!! serving from ${this.functionsRoot}`);
        response.send("Your function app is up and running");
    }

    invokeFunction(request, response) {

        logger.info("invokeFunction");        

        const functionName = request.params.funcName;

        logger.info(`Invoking function:${functionName}`);
        logger.info(`Functions root folder:${this.functionsRoot}`);

        const functionPath = path.join(this.functionsRoot, functionName);

        const funcRequestBuilder = new FuncRequestBuilder(request);
        const functionManager = new FunctionManager(request, response, functionPath, funcRequestBuilder);
        functionManager.invokeUserFunction();
    }

    start() {
        this.server.listen(port, () => { console.log("Starting server on port" + port); });
    }
}


let funcLiteServer = new FuncLiteServer();
funcLiteServer.start();