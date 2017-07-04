const path = require("path");
import { Logger } from "./Logger";

export class FunctionChangeHandler {
    private root:string;
    constructor(private functionsRoot: string) {
        this.root = path.resolve(functionsRoot);
    }

    onChange = (event: any, name: any) => {
        Object.keys(require.cache).forEach((filePath) => {
            if (path.resolve(filePath).startsWith(this.root)) {
                Logger.info(`Removing ${filePath} from require cache`);
                delete require.cache[filePath];
            }
        });
    }

    onError(error: any) {
        Logger.info(error.toString());
        console.log(error);
    }
}