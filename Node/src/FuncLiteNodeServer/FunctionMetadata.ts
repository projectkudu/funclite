export class FunctionMetadata {

  private _name: string;
  private _entryPoint: any;
  private _scriptFile: string;

  get entryPoint() : any{
      return this._entryPoint;
  }

  set entryPoint(entryPoint: any) {
    this._entryPoint = entryPoint;
  }

  get name(): string {
    return this._name;
  }

  set name(name: string) {
    this._name = name;
  }

  get scriptFile(): string {
    return this._scriptFile;
  }

  set scriptFile(scriptFile: string) {
    this._scriptFile = scriptFile;
  }

  get isDisabled(): boolean {
    return false;
  }

  get isExcluded(): boolean {
    return false;
  }


}