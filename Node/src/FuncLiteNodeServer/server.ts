import { FuncLiteServer } from "./FuncLiteServer";
import {Logger} from "./Logger";
import {FunctionsWatcher} from "./FunctionsWatcher";
import {Config} from "./Config";
import { FunctionChangeHandler } from "./FunctionChangeHandler";

Logger.initLogger();

let functionWatcher = new FunctionsWatcher(Config.functionsRoot);
functionWatcher.start();

let functionChangeHandler = new FunctionChangeHandler(Config.functionsRoot);
functionWatcher.onChange(functionChangeHandler.onChange);
functionWatcher.onError(functionChangeHandler.onError);

let funcLiteServer = new FuncLiteServer();
funcLiteServer.start();