import * as winston from "winston";
import * as path from "path";
import { Config } from "./Config";
import {FileUtils} from "./FileUtils";

export class Logger {

    static timeStampFormat = () => (new Date()).toLocaleTimeString();

    static logger: winston.LoggerInstance;

    static async initLogger(): Promise<void> {

        await FileUtils.mkdirp(Config.logsLocation);

        const logFile = path.join(Config.logsLocation, "Funclite.log");

        Logger.logger = new (winston.Logger)(
        {
            transports: [
                new (winston.transports.Console)({ colorize: true }),
                new (winston.transports.File)({ filename: logFile, timestamp: this.timeStampFormat(), level: 'info' })]
            });

        return Promise.resolve();
    }

    static info(msg: string) {
        Logger.logger.info(msg);
    }

    static async getLoggerForFunction(functionName: string): Promise<winston.LoggerInstance> {
        const logFileLocation: string = path.join(Config.rootLogPath, "function", functionName);
        const logFilePath = path.join(logFileLocation, `${Config.instanceId}-log.log`);
        try {
            await FileUtils.mkdirp(logFileLocation);
            const logger = new (winston.Logger)({
                transports: [
                    new (winston.transports.File)({ filename: logFilePath, timestamp: Logger.timeStampFormat(), level: 'info' })
                ]
            });
            return Promise.resolve(logger);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}