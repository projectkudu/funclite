import { FuncLiteServer } from "./FuncLiteServer";
import {Logger} from "./Logger";
import {FunctionsWatcher} from "./FunctionsWatcher";
import {Config} from "./Config";
import { FunctionChangeHandler } from "./FunctionChangeHandler";
import { FunctionManager } from "./FunctionManager";

Logger.initLogger();

let functionWatcher = new FunctionsWatcher(Config.functionsRoot);
functionWatcher.start();

let functionChangeHandler = new FunctionChangeHandler(Config.functionsRoot);
functionWatcher.onChange(functionChangeHandler.onChange);
functionWatcher.onError(functionChangeHandler.onError);

let functionManager = new FunctionManager(Config.functionsRoot);
let funcLiteServer = new FuncLiteServer(functionManager);
functionManager.processFunctions().then(() => { funcLiteServer.start(); });

