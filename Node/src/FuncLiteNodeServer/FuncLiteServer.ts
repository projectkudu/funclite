import * as express from "express";
import {Config} from "./Config";
import {Logger} from "./Logger";
import { Application, Request, Response } from "@types/express-serve-static-core";
import {FunctionPortalStub} from "./FunctionPortalStub";
import {FunctionManager} from "./FunctionManager";

export class FuncLiteServer {

    private readonly server: Application;

    constructor(private readonly functionManager: FunctionManager) {
        this.server = express();
        this.configureRoutes();
    }

    configureRoutes() {
        this.server.get("/", (request: any, response: any) => { this.warmup(request, response); });

        this.server.all("/api/:funcName", (request: any, response: any) => {
            this.invokeFunction(request, response);
        });

        this.server.post("/admin/host/ping", (request: any, response: any) => {
           this.respondToPing(request, response);
        });

        this.server.get("/admin/host/systemkeys/_master", (request: Request, response: Response) => {
           FunctionPortalStub.getMasterKey(request, response);
        });

        this.server.get("/admin/host/status", (request: any, response: any) => {
           FunctionPortalStub.getStatus(request, response);
        });

        this.server.get("/admin/functions/:functionName/status", (request: any, response: any) => {
           FunctionPortalStub.getFunctionStatus(request, response);
        });

        this.server.get("/admin/host/keys", (request: any, response: any) => {
           FunctionPortalStub.getHostKeys(request, response);
        });

        this.server.get("/admin/functions/:name/keys", (request: any, response: any) => {
           FunctionPortalStub.getFunctionKeys(request, response);
        });
    }

    respondToPing(request:any , response: any) {
        Logger.info("Responding to ping");
        response.sendStatus(200);
    }

    warmup(request: any, response: any) {
        Logger.info(`Your function app is up and running serving from ${this.functionManager.functionsRoot}`);
        response.send("Your function app is up and running");
    }

    async invokeFunction(request: any, response: any) {
      const functionName = request.params.funcName;
      Logger.info(`Invoking function:${functionName}`);
      await this.functionManager.invokeAsync(request, response);
    }

    start() {
        this.server.listen(Config.port, () => { console.log("Starting server on port" + Config.port); });
    }
}
