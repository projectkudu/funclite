import { FuncLiteServer } from "./FuncLiteServer";
import {Logger} from "./Logger";

Logger.initLogger();
let funcLiteServer = new FuncLiteServer();
funcLiteServer.start();