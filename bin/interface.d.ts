export type BasicParamsType = {
    serverIp: string;
    uuid: string;
};
export declare enum EnumDirection {
    IN = "IN",
    OUT = "OUT",
    ORIGINALLY_OUT = "ORIGINALLY_OUT"
}
export declare enum EnumHold {
    HOLD = "hold",
    UNHOLD = "unhold"
}
export type LogoutParamsType = BasicParamsType & {
    queueIds: Array<string>;
};
export type LoginParamsType = BasicParamsType & {
    extension: string;
    sipUrl: string;
};
export type SetStatusParamsType = BasicParamsType & {
    status: string;
};
export type SetStateParamsType = BasicParamsType & {
    state: string;
};
export type RemoveQueueParamsType = BasicParamsType & {
    queueIds: Array<string>;
};
export type RegisterQueueParamsType = BasicParamsType & {
    queueIds: Array<string>;
    existingQueueIds: Array<string>;
};
export type RequestSentimentAnalysisParamsType = Pick<BasicParamsType, 'serverIp'> & {
    uuid: string;
    recordingId: string;
};
export type StopSentimentAnalysisParamsType = Pick<BasicParamsType, 'serverIp'> & {
    uuid: string;
};
export type BridgeCallParamsType = Pick<BasicParamsType, 'serverIp'> & {
    destinationNumber: string;
    extension: string;
    domainName: string;
    recordingId: string;
    callerId: string;
};
export type CreateDirectoryParamsType = Pick<BasicParamsType, 'serverIp'> & {
    directory: string;
};
export type RecordsParamsType = Pick<BasicParamsType, 'serverIp'> & {
    uuid: string;
    action: string;
    fileName: string;
    filePath: string;
};
export type HangupParamsType = BasicParamsType;
export type HoldParamsType = BasicParamsType & {
    action: EnumHold;
};
export type DisplaceParamsType = HoldParamsType & {
    displaceFile: string;
};
export type BlindTransferParamsType = BasicParamsType & {
    destinationNumber: string;
    direction: EnumDirection;
};
export type BargeParamsType = BasicParamsType & {
    extension: string;
    sipUrl: string;
};
export type CoachParamsType = BasicParamsType & {
    extension: string;
    sipUrl: string;
    direction: EnumDirection;
};
export type MonitorParamsType = BasicParamsType & {
    extension: string;
    sipUrl: string;
};
export type AgentListByQueueIdParamsType = BasicParamsType;
export type CallQueuesByQueueIdParamsType = BasicParamsType;
export type AgentTransferParamsType = Pick<BasicParamsType, 'serverIp'> & {
    queue: string;
    fsRecordUuid: string;
    recordingId: string;
    destinationNumber: string;
    domainName: string;
    recordUuid: string;
    direction: string;
    firstAgent: string;
    prevAgent: string;
};
export type AgentListByQueueIdFsResponseType = {
    readonly busyDelayTime?: string;
    readonly callsAnswered?: string;
    readonly contact?: string;
    readonly externalCallsCount?: string;
    readonly instanceId?: string;
    readonly lastBridgeEnd?: string;
    readonly lastBridgeStart?: string;
    readonly lastOfferedCall?: string;
    readonly lastStatusChange?: string;
    readonly maxNoAnswer?: string;
    readonly name?: string;
    readonly noAnswerCount?: string;
    readonly noAnswerDelayTime?: string;
    readonly readyTime?: string;
    readonly rejectDelayTime?: string;
    readonly state?: string;
    readonly status?: string;
    readonly talkTime?: string;
    readonly type?: string;
    readonly uuid?: string;
    readonly wrapUpTime?: string;
};
export type AgentListByQueueIdResponseType = {
    readonly name: string;
    readonly instanceId: string;
    readonly uuid: string;
    readonly type: string;
    readonly contact: string;
    readonly status: string;
    readonly state: string;
    readonly maxNoAnswer: number;
    readonly wrapUpTime: number;
    readonly rejectDelayTime: number;
    readonly busyDelayTime: number;
    readonly noAnswerDelayTime: number;
    readonly lastBridgeStart: number;
    readonly lastBridgeEnd: number;
    readonly lastOfferedCall: number;
    readonly lastStatusChange: number;
    readonly noAnswerCount: number;
    readonly callsAnswered: number;
    readonly talkTime: number;
    readonly readyTime: number;
    readonly externalCallsCount: number;
};
