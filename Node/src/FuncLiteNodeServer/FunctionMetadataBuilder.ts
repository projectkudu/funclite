const path = require("path");
import { FunctionMetadata } from "./FunctionMetadata";
import { Config } from "./Config";
import {ScriptConstants} from "./ScriptConstants";
import {Utils} from "./Utils";
const util = require("util");
const fs = require("fs");

export class FunctionMetadataBuilder {
    private readonly functionPath: string;

  constructor(private functionName: string) {
    this.functionPath = path.join(Config.functionsRoot, functionName);
  }

  async build(): Promise<FunctionMetadata> {
    const functionMetadata = new FunctionMetadata();
    functionMetadata.name = this.functionName;
    const functionJson = await this.getFunctionJson();
    functionMetadata.scriptFile = await this.getPrimaryScriptFile(functionJson);
    functionMetadata.entryPoint = await this.getEntryPoint(functionMetadata.scriptFile, functionJson);
    return functionMetadata;
  }

  private stripBom(data: any) {
    // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
    if (Buffer.isBuffer(data)) {
       data = data.toString('utf8');
    }
    data = data.replace(/^\uFEFF/, '');
    return data;
  }

  private getFunctionJson(): Promise<any> {
    const functionJsonPath = path.join(this.functionPath, ScriptConstants.FunctionMetadataFileName);
    return new Promise( (resolve, reject) => {
      fs.readFile(functionJsonPath,
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

  private enumerateDirectory(directory: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(directory,
        (error: any, files: any[]) => {
          if (error) {
            reject(error);
          } else {
            resolve(files);
          }
        });
    });
  }

  private isPossibleScriptFile(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.stat(filePath,
        (error: any, stats: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(stats.isFile() && path.basename(filePath).toLocaleLowerCase() !== ScriptConstants.FunctionMetadataFileName);
          }
        });
    });
  }

  private isRunOrIndexFile(file: string): boolean {
    const fileNameWithoutExtension = path.basename(file, path.extname(file)).toLocaleLowerCase();
    const fileName = path.basename(file).toLocaleLowerCase();
    return fileNameWithoutExtension === "run" || fileName === "index.js";
  }

  private async getPrimaryScriptFile(functionJson: any): Promise<string> {
    let primaryScriptFile: string = "";

    const scriptFileFromConfig = functionJson["scriptFile"];

    if (scriptFileFromConfig) {
      primaryScriptFile = path.join(this.functionPath, scriptFileFromConfig);
    } else {

      let files: string[] = await this.enumerateDirectory(this.functionPath);
      files = files.map((file) => { return path.join(this.functionPath, file); });
      const filters: boolean[] = await Utils.filterAsync(files, this.isPossibleScriptFile);
      const scriptFiles: string[] = files.map((file: string, index: number) => {
          if (filters[index]) { return file; } else { return ""; }
      }).filter((file: string) => { return file !== ""; });

      switch (scriptFiles.length) {
      case 0:
        throw new Error("No script files in function");
      case 1:
        primaryScriptFile = scriptFiles[0];
        break;
      default:
          {
              const runFile = scriptFiles.find((scriptFile: string) => { return this.isRunOrIndexFile(scriptFile); });
              if (runFile) {
                  primaryScriptFile = runFile;
              }      
          }
      }
    }

    if (primaryScriptFile === "") {
      throw new Error("Couldn't locate primary script file");
    }

    return primaryScriptFile;
  }

  private async getEntryPoint(scriptFile: string, functionJson: any): Promise<any> {
    
    const userFunction = require(scriptFile);
    let entryPoint: any = userFunction;

    if (util.isObject(userFunction)) {
      const entryPointFromJson: string = functionJson["entryPoint"];
      if (entryPointFromJson) {
        entryPoint = entryPointFromJson;
      } else if (Object.keys(userFunction).length === 1) {
        const name = Object.keys(userFunction)[0];
        entryPoint = userFunction[name];
      } else {
        entryPoint = userFunction.run || userFunction.index;
      }
    }

    if (!util.isFunction(entryPoint)) {
      throw "Unable to find entry point";
    }

    return entryPoint;
  }

}