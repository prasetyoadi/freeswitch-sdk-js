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
export type LogoutParamsType = BasicParamsType;
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
    domainId: string;
};
export type RegisterQueueParamsType = RemoveQueueParamsType;
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
