import * as path from "path";

export class Environment {
    static get isAzureEnvironment(): boolean {
        return process.env.WEBSITE_INSTANCE_ID != null;
    }

    static get home(): string {
        return process.env.HOME;
    }

    static get functionsRoot(): string {
        return this.isAzureEnvironment ? path.join(this.home, "site", "wwwroot") : path.join(__dirname, "FunctionsRoot");
    }

    static get port(): number|string {
        return process.env.port || 1337;
    }
}