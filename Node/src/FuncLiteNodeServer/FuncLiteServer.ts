import { FunctionManager } from "./FunctionManager";
import { FuncRequestBuilder } from "./FuncRequestBuilder";
import * as express from "express";
import {Environment as Config} from "./Environment";
import {Logger} from "./Logger";
import * as path from "path";
import { Application, Request, Response } from "@types/express-serve-static-core";

export class FuncLiteServer {

  private server: Application;
    private functionsRoot: string;

    constructor() {

        this.functionsRoot = Config.functionsRoot;
        this.server = express();
        this.configureRoutes();
    }

    configureRoutes() {
        this.server.get("/", (request: any, response: any) => { this.warmup(request, response); });

        this.server.all("/api/:funcName", (request: any, response: any) => {
            this.invokeFunction(request, response);
        });

        // respond to ping from functions portal
        this.server.post("/admin/host/ping", (request: any, response: any) => { this.respondToPing(request, response); });

        // retrieve master key - GET https://funclite-fnapp.azurewebsites.net/admin/host/systemkeys/_master
        // [Route("admin/host/{keys:regex(^(keys|functionkeys|systemkeys)$)}/{name}")]
        this.server.get("/admin/host/systemkeys/_master", (request: Request, response: Response) => { this.getMasterKey(request, response); });

        this.server.get("/admin/host/status", (request: any, response: any) => { this.getStatus(request, response); });

        this.server.get("/admin/functions/:functionName/status", (request: any, response: any) => { this.getFunctionStatus(request, response); });

        this.server.get("/admin/host/keys", (request: any, response: any) => { this.getHostKeys(request, response); });

      this.server.get("/admin/functions/:name/keys", (request: any, response: any) => { this.getFunctionKeys(request, response);});
    }

  //
  //[Route("admin/functions/{name}/keys")]
  getFunctionKeys(request: any, response: any) {
    this.getHostKeys(request, response);
  }

    //[Route("admin/host/{keys:regex(^(keys|functionkeys|systemkeys)$)}")]
    getHostKeys(request: any, response: any) {
      // {"keys":[{"name":"default","value":"EAAyKFanqN/cKnUBB0WQEGE4Af6tpqi98Zos1sbYanWQUoceL3FNpw=="}],"links":[{"rel":"self","href":"https://fnfromportal.azurewebsites.net/admin/host/keys"}]}
      const hostKeys = '{"keys":[{"name":"default","value":"EAAyKFanqN/cKnUBB0WQEGE4Af6tpqi98Zos1sbYanWQUoceL3FNpw=="}]}';
      response.json(JSON.parse(hostKeys));
    }

    //[Route("admin/functions/{name}/status")]
    getFunctionStatus(request: any, response: any) {
      response.sendStatus(200);
    }

    // return %HOME%/data/function/secrets/host.json
    getMasterKey(request: Request, response: any) {
      Logger.info("retrieving masterkey");
      //{ "name":"_master", "value":"KprDXkWTHs1F1/KGHz5fhvsHhjRzNBarrUrxFxslHpQlRWsW4Dy02Q==", "links":[{ "rel": "self", "href": "https://fnfromportal.azurewebsites.net/admin/host/systemkeys/_master" }] }
      const masterKey = '{"name":"_master", "value": "KprDXkWTHs1F1/KGHz5fhvsHhjRzNBarrUrxFxslHpQlRWsW4Dy02Q=="}';
      response.json(JSON.parse(masterKey));
    }

  getStatus(request: any, response: any) {
    //{ "id":"fnfromportal", "state":"Running", "version":"1.0.11015.0" }
    const status = '{"id":"nameofsite", "state": "Running", "version":"0.0.1"}';
    response.json(JSON.parse(status));

  }

    respondToPing(request:any , response: any) {
        Logger.info("Responding to ping");
        response.sendStatus(200);
    }

    warmup(request: any, response: any) {
        Logger.info(`Your function app is up and running serving from ${this.functionsRoot}`);
        response.send("Your function app is up and running");
    }

    invokeFunction(request: any, response: any) {

        const functionName = request.params.funcName;

        Logger.info(`Invoking function:${functionName}`);

        const functionPath = path.join(this.functionsRoot, functionName);

        const funcRequestBuilder = new FuncRequestBuilder(request);
        const functionManager = new FunctionManager(request, response, functionPath, funcRequestBuilder);
        functionManager.invokeUserFunction();
    }

    start() {
        this.server.listen(Config.port, () => { console.log("Starting server on port" + Config.port); });
    }
}
