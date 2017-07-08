import { FuncLiteServer } from "./FuncLiteServer";
import {Logger} from "./Logger";
import {FunctionsWatcher} from "./FunctionsWatcher";
import {Config} from "./Config";
import { FunctionChangeHandler } from "./FunctionChangeHandler";
import { FunctionManager } from "./FunctionManager";

async function main() {
    // Wait for global logger init to complete
    await Logger.initLogger();

    const functionManager = new FunctionManager(Config.functionsRoot);
    const functionWatcher = new FunctionsWatcher(Config.functionsRoot);
    const functionChangeHandler = new FunctionChangeHandler(Config.functionsRoot, functionManager);
    const watcherPromise = functionWatcher.start(functionChangeHandler);

    const funcLiteServer = new FuncLiteServer(functionManager);
    const processFunctionsPromise = functionManager.processFunctions();

    Promise.all([watcherPromise, processFunctionsPromise]).then(() => { funcLiteServer.start(); })
        .catch((error) => { console.log(error); });
}

main();