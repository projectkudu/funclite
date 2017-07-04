const fs = require("fs");
import {FSWatcher} from "fs";
import {Assert} from "./Assert";
import { Logger } from "./Logger";

export class FunctionsWatcher {

    private watcher: FSWatcher;

    constructor(private functionsRoot: string) {
        Assert.assert(this.isDirectory(functionsRoot));
    }

    private isDirectory(path: string): boolean {
        return fs.existsSync(path) && fs.statSync(path).isDirectory();
    }

    start() {
        Logger.info(`Watching for changes in ${this.functionsRoot}`);
        this.watcher = fs.watch(this.functionsRoot, { recursive: true });
    }

    onChange(callback: (event:string, name:string)=>void) {
        this.watcher.on("change", callback);
    }

    onError(callback: (error: any)=>void) {
        this.watcher.on("error", callback);
    }
}