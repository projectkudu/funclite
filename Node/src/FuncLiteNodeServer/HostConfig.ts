export class HostConfig {
    private readonly hostId: string;
    private readonly httpConfig: Map<string, string>;
    private watchDirectories: string[];
    private readonly functions: string[];
    private readonly tracing: Map<string, string>;

    get HostId(): string {
        return this.hostId;
    }

    get WatchDirectories(): string[] {
        return this.watchDirectories;
    }

    set WatchDirectories(dirs: string[]) {
        this.watchDirectories = dirs;
    }

    constructor(hostId: string) {
        this.hostId = hostId;
        this.httpConfig = new Map<string, string>();
        this.functions = [];
        this.watchDirectories = [];
        this.tracing = new Map<string, string>();
    }

}