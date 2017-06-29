import * as winston from "winston";

import * as path from "path";
import {Environment as Config} from "./Environment";

export class Logger {

    static timeStampFormat = () => (new Date()).toLocaleTimeString();

    static logger: any;

    static initLogger() {

        const logLocation: string = Config.isAzureEnvironment ? path.join(Config.home,"LogFiles") : path.join(__dirname);
        const logFile = path.join(logLocation, "Funclite.log");

        Logger.logger = new (winston.Logger)(
        {
            transports: [
                new (winston.transports.Console)({ colorize: true }),
                new (winston.transports.File)({ filename: logFile, timestamp: this.timeStampFormat(), level: 'info' })]
        });
    }

    static info(msg: string) {
        Logger.logger.info(msg);
    }

}