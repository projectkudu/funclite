const fs = require("fs");
const path = require("path");

export class FileUtils {

    private static stripBom(data: any) {
        // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
        if (Buffer.isBuffer(data)) {
            data = data.toString('utf8');
        }
        data = data.replace(/^\uFEFF/, '');
        return data;
    }

    static readAsJson(jsonPath: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(jsonPath,
                (error: any, data: any) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(JSON.parse(this.stripBom(data)));
                    }
                });
            }
        );    
    }

    static writeFile(path: string, fileContents: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, fileContents,
                (error: any) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
        });
    }

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