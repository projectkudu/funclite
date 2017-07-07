import { Logger } from "./Logger";
import { Application, Request, Response } from "@types/express-serve-static-core";

export class FunctionPortalStub {
  //[Route("admin/host/{keys:regex(^(keys|functionkeys|systemkeys)$)}")]
  static getHostKeys(request: any, response: any) {
    const hostKeys = '{"keys":[{"name":"default","value":"EAAyKFanqN/cKnUBB0WQEGE4Af6tpqi98Zos1sbYanWQUoceL3FNpw=="}]}';
    response.json(JSON.parse(hostKeys));
  }

  //[Route("admin/functions/{name}/keys")]
  static getFunctionKeys(request: any, response: any) {
    FunctionPortalStub.getHostKeys(request, response);
  }

  //[Route("admin/functions/{name}/status")]
  static getFunctionStatus(request: any, response: any) {
    response.sendStatus(200);
  }

  // return %HOME%/data/function/secrets/host.json
  // [Route("admin/host/{keys:regex(^(keys|functionkeys|systemkeys)$)}/{name}")]
  static getMasterKey(request: Request, response: any) {
    Logger.info("retrieving masterkey");
    const masterKey = '{"name":"_master", "value": "KprDXkWTHs1F1/KGHz5fhvsHhjRzNBarrUrxFxslHpQlRWsW4Dy02Q=="}';
    response.json(JSON.parse(masterKey));
  }

  static getStatus(request: any, response: any) {
    const status = '{"id":"FuncLiteSiteName", "state": "Running", "version":"0.0.1"}';
    response.json(JSON.parse(status));
  }
}