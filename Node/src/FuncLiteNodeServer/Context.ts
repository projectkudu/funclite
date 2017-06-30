import * as util from "util";

type PromiseResolver = (value?: any | PromiseLike<any>) => void;
type PromiseRejector = (reason: any) => void;

export class Context {

    private _done: boolean;
    private doneResolver: PromiseResolver;
    private doneRejector: PromiseRejector;
    private donePromise: Promise<any>;

    constructor() {
        this.donePromise = new Promise((resolve: PromiseResolver, reject: PromiseRejector) => {
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
            if (result) {
                this.doneResolver(result);
            } else {
                const thisContext = this as any;
                this.doneResolver(thisContext.res);
            }
        }
    }

    waitForCompletion() {
        return this.donePromise;
    }

}