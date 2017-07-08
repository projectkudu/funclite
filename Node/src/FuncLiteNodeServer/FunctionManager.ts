import * as http from "http";
import { FunctionCollection } from "./FunctionCollection";
import {FuncRequestBuilder} from "./FuncRequestBuilder";
import {FuncRequest} from "./FuncRequest";
import {Context} from "./Context";

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

  async invokeAsync(request: http.ServerRequest, response: http.ServerResponse) {
    const functionName = (request as any).params.funcName.toLocaleLowerCase();
    const functionMetadata = this.functionCollection.get(functionName);

    if (functionMetadata) {
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