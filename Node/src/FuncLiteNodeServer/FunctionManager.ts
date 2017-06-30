import * as http from "http";
import ServerResponse = http.ServerResponse;
import ServerRequest = http.ServerRequest;
import {FuncRequestBuilder} from "./FuncRequestBuilder";
import {FuncRequest} from "./FuncRequest";
import {Context} from "./Context";

export class FunctionManager {

    constructor(private request : ServerRequest, private response: ServerResponse, private functionPath: string, private funcRequestBuilder: FuncRequestBuilder) {
    }

    userFuncSuccess(result: any) {
        const responseStatus = result.status || 200;
        this.response.writeHead(responseStatus, result.headers);
        this.response.end(JSON.stringify(result.body));
    }

    userFuncFailure(error: any) {
        this.response.writeHead(400, { 'Content-Type': 'application/json' });
        this.response.end(JSON.stringify(error));
    }

    onFuncRequestReady(funcRequest: FuncRequest) {
        const context = new Context();
        const userFunc = require(this.functionPath);
        userFunc(context, funcRequest);
        context.waitForCompletion().then((result) => {
             this.userFuncSuccess(result);
        }).catch((error) => { this.userFuncFailure(error); });
    }

    invokeUserFunction() {
        this.funcRequestBuilder.buildRequest().then((funcRequest: FuncRequest) => {
             this.onFuncRequestReady(funcRequest);
        });
    }
}