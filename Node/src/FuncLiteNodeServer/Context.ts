var util = require("util");

export class Context {

    private _done: boolean;
    private doneResolver;
    private doneRejector;
    private donePromise;

    constructor() {
        this.donePromise = new Promise((resolve, reject) => {
            this.doneResolver = resolve;
            this.doneRejector = reject;
        });
    }

    log(format: any, ...param: any[]) {
        const message: string = util.format.apply(null, arguments);
        console.log(message);
    }

    done(err: any, result: any) {
        if (this._done) {
            this.doneRejector("Error: 'done' has already been called. Please check your script for extraneous calls to 'done'.");
            return;
        }

        this._done = true;

        if (err) {
            this.doneRejector(err);
        }
        else {
            this.doneResolver(result);
        }
    }

    waitForCompletion() {
        return this.donePromise;
    }

}