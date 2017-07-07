export class ReflectedPromise {

  constructor(public data: any, public error: any, public status: string) {
  }

  isResolved(): boolean {
    return this.status === "resolved";
  }

  isRejected(): boolean {
    return this.status === "rejected";
  }

}

export class Utils {

  static filterAsync(array: any[], filterFn: (elem: any) => boolean | Promise<boolean>): Promise<boolean[]> {
    return Promise.all(array.map(elem => filterFn(elem)));
  }

  static reflect(promise: Promise<any>): Promise<ReflectedPromise>{
    return promise.then((value: any) => { return new ReflectedPromise(value, undefined, "resolved"); },
      (error: any) => { return new ReflectedPromise(undefined, error, "rejected"); });
  }
}