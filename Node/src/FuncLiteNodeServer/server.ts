import { FuncLiteServer } from "./FuncLiteServer";
import {Logger} from "./Logger";
import {FunctionsWatcher} from "./FunctionsWatcher";
import {Config} from "./Config";
import { FunctionChangeHandler } from "./FunctionChangeHandler";
import { FunctionManager } from "./FunctionManager";

Logger.initLogger();

let functionManager = new FunctionManager(Config.functionsRoot);

let functionWatcher = new FunctionsWatcher(Config.functionsRoot);
let functionChangeHandler = new FunctionChangeHandler(Config.functionsRoot, functionManager);
const watcherPromise = functionWatcher.start(functionChangeHandler);

let funcLiteServer = new FuncLiteServer(functionManager);
const processFunctionsPromise = functionManager.processFunctions();

Promise.all([watcherPromise, processFunctionsPromise]).then(() => { funcLiteServer.start(); })
    .catch((error) => { console.log(error); });

