import { FunctionManager } from "./FunctionManager";
import { FuncRequestBuilder } from "./FuncRequestBuilder";
import * as express from "express";
import {Environment as Config} from "./Environment";
import {Logger} from "./Logger";
import * as path from "path";

export class FuncLiteServer {

    private server;
    private functionsRoot: string;

    constructor() {

        this.functionsRoot = Config.functionsRoot;
        this.server = express();
        this.configureRoutes();
    }

    configureRoutes() {
        this.server.get("/", (request, response) => { this.warmup(request, response); });
        this.server.post("/api/:funcName", (request, response) => {
            this.invokeFunction(request, response);
        });

        // respond to ping from functions portal
        this.server.post("/admin/host/ping", (request, response) => { this.respondToPing(request, response); });
    }

    respondToPing(request, response) {
        Logger.info("Responding to ping");
        response.sendStatus(200);
    }

    warmup(request, response) {
        Logger.info(`Your function app is up and running serving from ${this.functionsRoot}`);
        response.send("Your function app is up and running");
    }

    invokeFunction(request, response) {

        Logger.info("invokeFunction");

        const functionName = request.params.funcName;

        Logger.info(`Invoking function:${functionName}`);
        Logger.info(`Functions root folder:${this.functionsRoot}`);

        const functionPath = path.join(this.functionsRoot, functionName);

        const funcRequestBuilder = new FuncRequestBuilder(request);
        const functionManager = new FunctionManager(request, response, functionPath, funcRequestBuilder);
        functionManager.invokeUserFunction();
    }

    start() {
        this.server.listen(Config.port, () => { console.log("Starting server on port" + Config.port); });
    }
}
