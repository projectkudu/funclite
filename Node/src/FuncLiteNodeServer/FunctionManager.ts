import * as http from "http";
import { FunctionCollection } from "./FunctionCollection";
import {FuncRequestBuilder} from "./FuncRequestBuilder";
import {FuncRequest} from "./FuncRequest";
import {Context} from "./Context";
import { Config } from "./Config";
import {FunctionMetadata} from "./FunctionMetadata";
const path = require("path");
type FunctionType = (...args: any[]) => any; 

export class FunctionManager {

  private functionCollection: FunctionCollection;

  constructor(public functionsRoot: string) {
      this.functionCollection = new FunctionCollection(this.functionsRoot);
  }

  async processFunctions() {
      await this.functionCollection.processFunctions();
  }

  private deferInvoke(entryPoint: FunctionType, context: Context, funcRequest: FuncRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => { entryPoint(context, funcRequest) });
      context.waitForCompletion().then((result) => { resolve(result); }).catch((error) => { reject(error); });
    });
  }

  private async doInvokeAsync(request: http.ServerRequest, response: http.ServerResponse, functionMetadata: FunctionMetadata) {
    try {
        const funcRequestBuilder = new FuncRequestBuilder(request);
        const funcRequest: FuncRequest = await funcRequestBuilder.buildRequest();
        const context = new Context(functionMetadata);
        const entryPoint = await functionMetadata.getEntryPoint();
        const result = await this.deferInvoke(entryPoint, context, funcRequest);
        const responseStatus = result.status || 200;
        response.writeHead(responseStatus, result.headers);
        response.end(JSON.stringify(result.body));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(error));
    }
    }

  async invokeAsync(request: http.ServerRequest, response: http.ServerResponse) {
    const functionName: string = (request as any).params.funcName.toLocaleLowerCase();
    let functionMetadata = this.functionCollection.get(functionName);

    if (!functionMetadata) {
        // In most cases file watcher should have processed this directory already and we never get here.
        console.log(`Add new function outside watcher: ${functionName}`);
        const functionPath = path.join(Config.functionsRoot, functionName);
        await this.addFunctionDir(functionPath);
        functionMetadata = this.functionCollection.get(functionName);
    }

    if (functionMetadata) {
        await this.doInvokeAsync(request, response, functionMetadata);
    } else {
        (response as any).sendStatus(404);
    }
  }

  async addFunctionDir(path: string) {
      console.log("FunctionManager::addFunctionDir " + path);
        await this.functionCollection.addFunctionDir(path);
    }

    removeFunctionDir(path: string) {
        this.functionCollection.removeFunctionDir(path);
    }

}