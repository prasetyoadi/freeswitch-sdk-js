"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeSwitchEngine = void 0;
const interface_1 = require("./interface");
const esl = require('modesl');
class FreeSwitchEngine {
    constructor() {
        this.defaultPortNumber = 8021;
        this.defaultPassword = 'ClueCon';
        this.host = '';
        this.port = this.defaultPortNumber;
        this.password = this.defaultPassword;
    }
    logCommand(cmd, res) {
        if (res)
            console.log(`Command "api ${cmd}" | Result "${res.body.trim()}"`);
        else
            console.log(`Command "api ${cmd}"`);
    }
    api(commands) {
        const conn = new esl.Connection(this.host, this.port, this.password, () => {
            if (conn.connected()) {
                commands.forEach((cmd) => {
                    conn.api(cmd, (r) => {
                        this.logCommand(cmd, r);
                    });
                });
                conn.disconnect();
            }
        });
    }
    setHost(host) {
        this.host = host;
    }
    setPort(port) {
        this.port = port;
    }
    setPassword(password) {
        this.password = password;
    }
    logout(params) {
        this.setHost(params.serverIp);
        console.log(`[logout]: Freeswitch logout, params: `, JSON.stringify(params));
        this.api([`callcenter_config agent del ${params.uuid}`]);
    }
    login(params) {
        this.setHost(params.serverIp);
        console.log(`[login]: Freeswitch login, params: `, JSON.stringify(params));
        this.api([
            `callcenter_config agent add ${params.uuid} callback`,
            `callcenter_config agent set contact ${params.uuid} user/${params.extension}@${params.sipUrl}`,
            `callcenter_config agent set status ${params.uuid} 'Logged Out'`,
        ]);
    }
    removeQueue(params) {
        this.setHost(params.serverIp);
        console.log(`[removeQueue]: Freeswitch remove queue, params: `, JSON.stringify(params));
        this.api(params.queueIds.map((queueId) => `callcenter_config tier del ${queueId}${params.uuid}`));
    }
    registerQueue(params) {
        this.removeQueue(params);
        this.setHost(params.serverIp);
        console.log(`[registerQueue]: Freeswitch register queue, params: `, JSON.stringify(params));
        this.api(params.queueIds.map((queueId) => `callcenter_config tier add ${queueId} ${params.uuid} 1 1`));
    }
    setStatus(params) {
        this.setHost(params.serverIp);
        console.log(`[setStatus]: Freeswitch set status to ${params.status}, params: `, JSON.stringify(params));
        this.api([
            `callcenter_config agent set status ${params.uuid} ${params.status}`,
        ]);
    }
    setState(params) {
        this.setHost(params.serverIp);
        console.log(`[setState]: Freeswitch set state to ${params.state}, params: `, JSON.stringify(params));
        this.api([
            `callcenter_config agent set state ${params.uuid} ${params.state}`,
        ]);
    }
    requestSentimentAnalysis(params) {
        const { recordingId, serverIp, uuid } = params;
        this.setHost(serverIp);
        console.log(`[requestSentimentAnalysis]: Freeswitch sentiment analysis for call, params: `, JSON.stringify(params));
        this.api([
            `originate {origination_caller_id_number=12345,ignore_early_media=true}sofia/internal/1483#${recordingId}@${serverIp}&eavesdrop(${uuid})`,
        ]);
    }
    stopSentimentAnalysis(params) {
        this.setHost(params.serverIp);
        console.log(`[stopSentimentAnalysis]: Stop sentiment analysis. params: `, JSON.stringify(params));
        this.api([`uuid_kill ${params.uuid}`]);
    }
    bridgeCall(params) {
        const { extension, callerId, destinationNumber, domainName, recordingId, serverIp, } = params;
        this.setHost(serverIp);
        console.log(`[bridgeCall]: Freeswich bridge. params: `, JSON.stringify(params));
        this.api([
            `originate {origination_caller_id_number=${callerId},origination_caller_id_name=DialerExternal#${domainName}#${recordingId}#${destinationNumber}#${callerId},ignore_early_media=true,call_timeout=60,hangup_after_bridge=true}sofia/internal/${extension}@${domainName} &bridge({origination_caller_id_name=DialerInternal#${recordingId}#${destinationNumber}}user/${extension}@${domainName}`,
        ]);
    }
    createDirectory(params) {
        this.setHost(params.serverIp);
        console.log(`[createDirectory]: Freeswitch Create Switch directory. params: `, JSON.stringify(params));
        this.api([`lua mkdir.lua ${params.directory}`]);
    }
    records(params) {
        this.setHost(params.serverIp);
        console.log(`[records]: Freeswitch ${params.action} recording. params: `, JSON.stringify(params));
        this.api([
            `uuid_record ${params.uuid} ${params.action} ${params.filePath}${params.fileName}`,
        ]);
    }
    hangup(params) {
        this.setHost(params.serverIp);
        console.log(`[hangup]: Freeswitch kill uuid with params: `, JSON.stringify(params));
        this.api([`uuid_kill ${params.uuid}`]);
    }
    hold(params) {
        this.setHost(params.serverIp);
        console.log(`[hold]: Freeswitch ${params.action} uuid with params: `, JSON.stringify(params));
        this.api([
            `uuid_hold ${params.action === interface_1.EnumHold.UNHOLD && 'off'} ${params.uuid}`,
        ]);
    }
    displace(params) {
        this.setHost(params.serverIp);
        console.log(`[displace]: Freeswitch displace. params: `, JSON.stringify(params));
        const isHold = params.action === interface_1.EnumHold.HOLD;
        const startOrStop = isHold ? 'start' : 'stop';
        const zeroLoop = isHold ? ' 0 loop' : '';
        this.api([
            `uuid_displace ${params.uuid} ${startOrStop} ${params.displaceFile}${zeroLoop}`,
        ]);
    }
    blindTransfer(params) {
        this.setHost(params.serverIp);
        console.log(`[blindTransfer]: Freeswich blind transfer params: `, JSON.stringify(params));
        const isIncoming = params.direction === interface_1.EnumDirection.IN;
        this.api([
            `uuid_transfer ${params.uuid} ${isIncoming && '-bleg '}${params.destinationNumber}`,
        ]);
    }
    barge(params) {
        this.setHost(params.serverIp);
        console.log(`[barge]: Freeswich barge call. params: `, JSON.stringify(params));
        this.api([
            `originate user/${params.extension}@${params.sipUrl} 'queue_dtmf:w3@500,eavesdrop:${params.uuid}' inline`,
        ]);
    }
    monitor(params) {
        this.setHost(params.serverIp);
        console.log(`[monitor]: Freeswich monitor call. params: `, JSON.stringify(params));
        this.api([
            `originate user/${params.extension}@${params.sipUrl} &eavesdrop(${params.uuid})`,
        ]);
    }
    coach(params) {
        this.setHost(params.serverIp);
        console.log(`[coach]: Freeswich coach call uuid: ${params.uuid}`);
        const isIncoming = params.direction === interface_1.EnumDirection.IN;
        const dtmfQueue = isIncoming ? 'w2@500' : 'w1@500';
        this.api([
            `originate user/${params.extension}@${params.sipUrl} 'queue_dtmf:${dtmfQueue},eavesdrop:${params.uuid}' inline`,
        ]);
    }
    agentListByQueues(params) {
        this.setHost(params.serverIp);
        console.log(`[agentListByQueues]: Freeswich agent list by queue. params: `, JSON.stringify(params));
        this.api([`callcenter_config queue list agents ${params.uuid}`]);
    }
    callQueuesByQueueId(params) {
        this.setHost(params.serverIp);
        console.log(`[callQueuesByQueueId]: Freeswich get call queue. params: `, JSON.stringify(params));
        this.api([`callcenter_config queue list members ${params.uuid}`]);
    }
    agentTransfer(params) {
        this.setHost(params.serverIp);
        console.log(`[agentTransfer]: Freeswich agent call transfer FS record. params: `, JSON.stringify(params));
        const isIncoming = params.direction === interface_1.EnumDirection.IN;
        const isOutgoing = params.direction === interface_1.EnumDirection.OUT;
        const isOriginallyOut = params.direction === interface_1.EnumDirection.ORIGINALLY_OUT;
        const optionBleg = `${isOutgoing || isOriginallyOut ? ' -bleg ' : ''}`;
        const optionRecordUuid = isOutgoing
            ? params.fsRecordUuid
            : params.recordUuid;
        const optionCommandRecordUuid = isIncoming
            ? params.fsRecordUuid
            : params.recordUuid;
        const optionTarget = `${params.queue}#${optionCommandRecordUuid}#${params.recordingId}#${params.destinationNumber}#${params.firstAgent}#${params.prevAgent} XML ${params.domainName}`;
        this.api([
            `uuid_transfer ${optionRecordUuid} ${optionBleg} ${optionTarget}`,
        ]);
    }
}
exports.FreeSwitchEngine = FreeSwitchEngine;
