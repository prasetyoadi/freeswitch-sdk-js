import type { AgentListByQueueIdFsResponseType } from './interface';
export default class FreeswichHelper {
    private readonly resOk;
    trimUpperValue(value: string): string;
    freeswitchStringToArray(value: string, delimiter: string): AgentListByQueueIdFsResponseType[];
    logCommand(cmd: string, res?: {
        body: string;
    }): void;
}
