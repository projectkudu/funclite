import * as winston from "winston";

import * as path from "path";
import { Config } from "./Config";

import * as fs from "fs";

export class Logger {

    static timeStampFormat = () => (new Date()).toLocaleTimeString();

    static logger: winston.LoggerInstance;

    static initLogger() {
        if (!fs.existsSync(Config.logsLocation)) {
            fs.mkdirSync(Config.logsLocation);
        }

        const logFile = path.join(Config.logsLocation, "Funclite.log");

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