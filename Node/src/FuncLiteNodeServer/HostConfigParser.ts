import {HostConfig} from "./HostConfig";
import {FileUtils} from "./FileUtils";
import {Config} from "./Config";
const path = require("path");

export class HostConfigParser {
    private readonly configJsonPath: string;

    constructor(configJsonPath: string) {
        this.configJsonPath = configJsonPath;
    }

    private getValueForKey(json: any, key: string): string|string[] {
        return json[key];
    }


    private async getJson(): Promise<any> {
        return await FileUtils.readAsJson(this.configJsonPath);
    }

    private getWatchDirectories(json: any): string[] {
        const relativePaths: any = this.getValueForKey(json, "watchDirectories");
        if (Array.isArray(relativePaths)) {
            return (relativePaths as string[]).map((dir) => { return path.join(Config.functionsRoot, dir); });
        } else {
            return [];
        }
    }

    async parse(): Promise<HostConfig> {
        const hostJson: any = await this.getJson();
        let hostId = this.getValueForKey(hostJson, "id");
        if (!hostId) {
            hostId = Config.instanceId;
        }
        const hostConfig = new HostConfig(hostId as string);
        hostConfig.WatchDirectories = this.getWatchDirectories(hostJson);

        return hostConfig;
    }
}