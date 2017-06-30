import * as http from "http";
import { FuncRequest } from "./FuncRequest";
import { Url, parse } from "url";

export class FuncRequestBuilder {

    static maxPostBodySize = Math.pow(10, 6); // 1 MB
    private parsedUrl: Url;

    constructor(private request: http.ServerRequest) {
        this.parsedUrl = parse(this.request.url as string, true);
    }

    buildRequest(): Promise<FuncRequest> {
        return new Promise((resolve, reject) => {
            const funcRequest = new FuncRequest();
            funcRequest.method = this.method;
            funcRequest.originalUrl = this.originalUrl;
            funcRequest.query = this.query;
            funcRequest.headers = this.headers;
            funcRequest.params = this.params;
            this.getRequestRawBody().then((requestBody: string) => {
                funcRequest.rawBody = requestBody;
                funcRequest.body = funcRequest.rawBody ? JSON.parse(funcRequest.rawBody) : null;
                resolve(funcRequest);
            }).catch((error) => { reject(error); });
        });
    }

    private get params(): any {
        const thisRequest = this.request as any;
        return thisRequest.params;
    }
    private get originalUrl(): string {
        return this.parsedUrl.href as string;
    }

    private get method(): string {
        return this.request.method as string;
    }

    private get query(): any {
        return this.parsedUrl.query;
    }

    private get headers(): any {
        return this.request.headers;
    }

    private getRequestRawBody(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.request.method === "POST") {
                const rawBody:Buffer[] = [];
                this.request.on("data",
                    (data: Buffer)=> {
                        rawBody.push(data);
                        if (rawBody.length > FuncRequestBuilder.maxPostBodySize) {
                            this.request.connection.destroy();
                            reject(413);
                        }
                    });

                this.request.on("end",
                    () => {
                        const rawBodyString = Buffer.concat(rawBody).toString();
                        resolve(rawBodyString);
                    });
            } else {
                resolve("");
            }
        });
    }
}