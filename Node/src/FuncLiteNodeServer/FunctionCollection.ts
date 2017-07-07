const fs = require("fs");
const path = require("path");

import { FunctionMetadata } from "./FunctionMetadata";
import {Utils, ReflectedPromise } from "./Utils";
import {ScriptConstants} from "./ScriptConstants";

export class FunctionCollection {
  private functionsMap: Map<string, FunctionMetadata>;

  constructor(private functionsRoot: string) {
    this.functionsMap = new Map<string, FunctionMetadata>();
  }

  private fileExists(filePath: string): Promise<boolean> {
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

  private isDirectory(filePath: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      fs.stat(filePath,
        (error: any, stats: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(stats.isDirectory());
          }
        });
    });
  }

  private async isFunctionDirectory(filePath: string): Promise<boolean> {
    const isDirectory = await this.isDirectory(filePath);
    if (isDirectory) {
      const functionsJsonPath = path.join(filePath, ScriptConstants.FunctionMetadataFileName);
      const hasFunctionsJson = await this.fileExists(functionsJsonPath);
      return hasFunctionsJson;
    } else {
      return false;
    }
  }

  private enumerateDirectory(directory: string): Promise<string[]> {
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

  async processFunctions() {
    const files: string[] = await this.enumerateDirectory(this.functionsRoot);
    const isFunction: boolean[] = await Promise.all(files.map(file => this.isFunctionDirectory(path.join(this.functionsRoot, file))));
    const functionNames: string[] = files.filter((file, index) => { return isFunction[index] });

    const builderPromises: Promise<FunctionMetadata>[] = functionNames.map((functionName : string)=> {
        const functionMetadata: FunctionMetadata = new FunctionMetadata(functionName);
        return functionMetadata.build();
    });
    const reflectedPromise: ReflectedPromise[] = await Promise.all(builderPromises.map(Utils.reflect));
    const resolvedPromises: ReflectedPromise[] = reflectedPromise.filter((promise) => {
      return promise.isResolved();
    });

    for (let resolvedPromise of resolvedPromises) {
      const functionMetadata = resolvedPromise.data as FunctionMetadata;
      this.functionsMap.set(functionMetadata.name.toLocaleLowerCase(), functionMetadata);
    }

    for (let rejectedPromise of reflectedPromise.filter((promise) => { return promise.isRejected(); })) {
      console.log(rejectedPromise.error);
    }
  }

  get(functionName: string): FunctionMetadata | undefined {
    return this.functionsMap.get(functionName);
  }

}