export class Assert {
    static assert(condition: boolean) {
        if (!condition) {
            throw new Error("assert failed");
        }
    }
}