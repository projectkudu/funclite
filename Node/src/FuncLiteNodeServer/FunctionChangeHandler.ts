const path = require("path");
import { Logger } from "./Logger";
import {FunctionManager} from "./FunctionManager";

export class FunctionChangeHandler {

    private readonly root:string;
    constructor(private readonly functionsRoot: string, private readonly functionManager: FunctionManager) {
        this.root = path.resolve(functionsRoot);
    }

    private clearRequireCache = () => {
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

    onChange = (path: string) => {
        // Clear the require cache
        console.log(`${path} was changed. Clearing require cache`);
        Logger.info(`${path} was changed. Clearing require cache`);
        this.clearRequireCache();
    }

    onAdd = (path: string) => {
        // New File added. On its own this doesn't mean a new function / change to existing function
        console.log(`${path} was added`);
        Logger.info(`${path} was added`);
    }

    onDelete = (path: string) => {
        console.log(`${path} was deleted. Clearing require cache`);
        Logger.info(`${path} was deleted. Clearing require cache`);
        this.clearRequireCache();
    }

    onAddDir = async (path: string) => {
        // possible new function added
        console.log(`${path} was added (dir)`);
        Logger.info(`${path} was added (dir)`);
        await this.functionManager.addFunctionDir(path);
    }

    onDeleteDir = (path: string) => {
        // possible function deleted
        console.log(`${path} was deleted (dir)`);
        Logger.info(`${path} was deleted (dir)`);
        this.functionManager.removeFunctionDir(path);
    }

}