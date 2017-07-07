const chokidar = require("chokidar");
import {FSWatcher} from "fs";
import { Logger } from "./Logger";
import {FunctionChangeHandler} from "./FunctionChangeHandler";

export class FunctionsWatcher {

    private watcher: FSWatcher;
    private watchPromise: Promise<any>;

    constructor(private functionsRoot: string) {
        Logger.info(`Watching for changes in ${this.functionsRoot}`);

        this.watchPromise = new Promise((resolve, reject) => {
            this.watcher = chokidar.watch(this.functionsRoot,
                {
                    ignored: /(^|[\/\\])\../,
                    persistent: true,
                    ignoreInitial: true,
                    ignorePermissionErrors: true
                });
            this.watcher.on("ready", () => resolve());
            this.watcher.on("error", (error) => reject(error));
        });
    }

    async start(handler: FunctionChangeHandler): Promise<any> {
        try {
            await this.watchPromise;
            this.setChangeHandler(handler);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private setChangeHandler(handler: FunctionChangeHandler) {
        this.watcher.removeAllListeners();
        this.watcher.on("add", handler.onAdd);
        this.watcher.on("addDir", handler.onAddDir);
        this.watcher.on("unlink", handler.onDelete);
        this.watcher.on("unlinkDir", handler.onDeleteDir);
        this.watcher.on("error", handler.onError);
        this.watcher.on("change", handler.onChange);
    }

}