import { FuncLiteServer } from "./FuncLiteServer";
import {Logger} from "./Logger";
import {FunctionsWatcher} from "./FunctionsWatcher";
import {Config} from "./Config";
import { FunctionChangeHandler } from "./FunctionChangeHandler";
import { FunctionManager } from "./FunctionManager";
import {HostConfigParser} from "./HostConfigParser";
import {ScriptConstants} from "./ScriptConstants";
import {FileUtils} from "./FileUtils";
const path = require("path");

async function main() {
    // Wait for global logger init to complete
    await Logger.initLogger();

    const functionManager = new FunctionManager(Config.functionsRoot);
    const functionWatcher = new FunctionsWatcher(Config.functionsRoot);
    const functionChangeHandler = new FunctionChangeHandler(Config.functionsRoot, functionManager);
    const watcherPromise = functionWatcher.start(functionChangeHandler);

    const funcLiteServer = new FuncLiteServer(functionManager);
    const processFunctionsPromise = functionManager.processFunctions();

    const hostConfigPath = path.join(Config.functionsRoot, ScriptConstants.HostMetadataFileName);
    const hostConfigExists = await FileUtils.fileExists(hostConfigPath);

    if (!hostConfigExists) {
        await FileUtils.writeFile(hostConfigPath, "{}");
    }
    const hostConfigParser = new HostConfigParser(hostConfigPath);
    const hostConfig = hostConfigParser.parse();


    Promise.all([watcherPromise, processFunctionsPromise]).then(() => { funcLiteServer.start(); })
        .catch((error) => { console.log(error); });
}

main();