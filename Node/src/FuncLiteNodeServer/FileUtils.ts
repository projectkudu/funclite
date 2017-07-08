const fs = require("fs");
const path = require("path");

export class FileUtils {
    static fileExists(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.stat(filePath,
                (error: any, stats: any) => {
                    if (!error) {
                        resolve(true);
                    } else if (error.code === "ENOENT") {
                        resolve(false);
                    } else {
                        console.log(error);
                        resolve(false);
                    }
                });
        });
    }

    static mkdirp(filePath: string): Promise<string> {
        const separator = path.sep;
        const initialDirectory = path.isAbsolute(filePath) ? separator : "";
        const initialPromise: Promise<string> = Promise.resolve(initialDirectory);
        const fileParts = filePath.split(separator).map((s) => { return Promise.resolve(s); });

        const promise = new Promise((resolve, reject) => {
            const reduce = fileParts.reduce(async (parentDir: Promise<string>, childDir: Promise<string>) => {
                const parent: string = await parentDir;
                const child: string = await childDir;
                const currentDir = path.resolve(parent, child);
                const exists = await FileUtils.fileExists(currentDir);
                if (!exists) {
                    fs.mkdirSync(currentDir);
                }
                return Promise.resolve(currentDir);
            },
            initialPromise);

            resolve(reduce);
        });
        return promise;
    }
}