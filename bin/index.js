"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeSwitchEngine = void 0;
const helper_1 = __importDefault(require("./helper"));
const interface_1 = require("./interface");
const esl = require('modesl');
class FreeSwitchEngine extends helper_1.default {
    constructor() {
        super(...arguments);
        this.defaultPortNumber = 8021;
        this.defaultPassword = 'ClueCon';
        this.className = FreeSwitchEngine.name;
        this.host = '';
        this.port = this.defaultPortNumber;
        this.password = this.defaultPassword;
    }
    apis(commands) {
        try {
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
        catch (_a) {
            console.error(`[FreeSwitchEngine:apis] Fs can't connect to host ${this.host}`);
        }
    }
    api(cmd) {
        return new Promise((resolve, reject) => {
            try {
                const conn = new esl.Connection(this.host, this.port, this.password, () => {
                    if (conn.connected()) {
                        conn.api(cmd, (r) => {
                            this.logCommand(cmd, r);
                            resolve(r.body);
                        });
                        conn.disconnect();
                    }
                });
            }
            catch (_a) {
                console.error(`[FreeSwitchEngine:api] Fs can't connect to host ${this.host}`);
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
        return __awaiter(this, void 0, void 0, function* () {
            this.removeQueue(params);
            this.setHost(params.serverIp);
            console.log(`[${this.className}][logout]: Freeswitch logout, params: `, JSON.stringify(params));
            this.apis([`callcenter_config agent del ${params.uuid}`]);
        });
    }
    login(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][login]: Freeswitch login, params: `, JSON.stringify(params));
            this.apis([
                `callcenter_config agent add ${params.uuid} callback`,
                `callcenter_config agent set contact ${params.uuid} user/${params.extension}@${params.sipUrl}`,
                `callcenter_config agent set status ${params.uuid} 'Logged Out'`,
            ]);
        });
    }
    removeQueue(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][removeQueue]: Freeswitch remove queue, params: `, JSON.stringify(params));
            this.apis(params.queueIds.map((queueId) => `callcenter_config tier del ${queueId} ${params.uuid}`));
        });
    }
    registerQueue(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeQueue({
                serverIp: params.serverIp,
                uuid: params.uuid,
                queueIds: params.existingQueueIds,
            });
            setTimeout(() => {
                this.setHost(params.serverIp);
                console.log(`[${this.className}][registerQueue]: Freeswitch register queue, params: `, JSON.stringify(params));
                this.apis(params.queueIds.map((queueId) => `callcenter_config tier add ${queueId} ${params.uuid} 1 1`));
            }, 500);
        });
    }
    setStatus(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][setStatus]: Freeswitch set status to ${params.status}, params: `, JSON.stringify(params));
            this.apis([
                `callcenter_config agent set status ${params.uuid} '${params.status}'`,
            ]);
        });
    }
    setState(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][setState]: Freeswitch set state to ${params.state}, params: `, JSON.stringify(params));
            this.apis([
                `callcenter_config agent set state ${params.uuid} '${params.state}'`,
            ]);
        });
    }
    requestSentimentAnalysis(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recordingId, serverIp, uuid } = params;
            this.setHost(serverIp);
            console.log(`[${this.className}][requestSentimentAnalysis]: Freeswitch sentiment analysis for call, params: `, JSON.stringify(params));
            this.apis([
                `originate {origination_caller_id_number=12345,ignore_early_media=true}sofia/internal/1483#${recordingId}@${serverIp}&eavesdrop(${uuid})`,
            ]);
        });
    }
    stopSentimentAnalysis(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][stopSentimentAnalysis]: Stop sentiment analysis. params: `, JSON.stringify(params));
            this.apis([`uuid_kill ${params.uuid}`]);
        });
    }
    bridgeCall(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { extension, callerId, destinationNumber, domainName, recordingId, serverIp, } = params;
            this.setHost(serverIp);
            console.log(`[${this.className}][bridgeCall]: Freeswich bridge. params: `, JSON.stringify(params));
            this.apis([
                `originate {origination_caller_id_number=${callerId},origination_caller_id_name=DialerExternal#${domainName}#${recordingId}#${destinationNumber}#${callerId},ignore_early_media=true,call_timeout=60,hangup_after_bridge=true}sofia/internal/${extension}@${domainName} &bridge({origination_caller_id_name=DialerInternal#${recordingId}#${destinationNumber}}user/${extension}@${domainName}`,
            ]);
        });
    }
    createDirectory(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][createDirectory]: Freeswitch Create Switch directory. params: `, JSON.stringify(params));
            this.apis([`lua mkdir.lua ${params.directory}`]);
        });
    }
    records(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][records]: Freeswitch ${params.action} recording. params: `, JSON.stringify(params));
            this.apis([
                `uuid_record ${params.uuid} ${params.action} ${params.filePath}${params.fileName}`,
            ]);
        });
    }
    hangup(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][hangup]: Freeswitch kill uuid with params: `, JSON.stringify(params));
            this.apis([`uuid_kill ${params.uuid}`]);
        });
    }
    hold(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][hold]: Freeswitch ${params.action} uuid with params: `, JSON.stringify(params));
            this.apis([
                `uuid_hold ${params.action === interface_1.EnumHold.UNHOLD && 'off'} ${params.uuid}`,
            ]);
        });
    }
    displace(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][displace]: Freeswitch displace. params: `, JSON.stringify(params));
            const isHold = params.action === interface_1.EnumHold.HOLD;
            const startOrStop = isHold ? 'start' : 'stop';
            const zeroLoop = isHold ? ' 0 loop' : '';
            this.apis([
                `uuid_displace ${params.uuid} ${startOrStop} ${params.displaceFile}${zeroLoop}`,
            ]);
        });
    }
    blindTransfer(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][blindTransfer]: Freeswich blind transfer params: `, JSON.stringify(params));
            const isIncoming = params.direction === interface_1.EnumDirection.IN;
            this.apis([
                `uuid_transfer ${params.uuid} ${isIncoming && '-bleg '}${params.destinationNumber}`,
            ]);
        });
    }
    barge(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][barge]: Freeswich barge call. params: `, JSON.stringify(params));
            this.apis([
                `originate user/${params.extension}@${params.sipUrl} 'queue_dtmf:w3@500,eavesdrop:${params.uuid}' inline`,
            ]);
        });
    }
    monitor(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][monitor]: Freeswich monitor call. params: `, JSON.stringify(params));
            this.apis([
                `originate user/${params.extension}@${params.sipUrl} &eavesdrop(${params.uuid})`,
            ]);
        });
    }
    coach(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][coach]: Freeswich coach call uuid: ${params.uuid}`);
            const isIncoming = params.direction === interface_1.EnumDirection.IN;
            const dtmfQueue = isIncoming ? 'w2@500' : 'w1@500';
            this.apis([
                `originate user/${params.extension}@${params.sipUrl} 'queue_dtmf:${dtmfQueue},eavesdrop:${params.uuid}' inline`,
            ]);
        });
    }
    agentListByQueues(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][agentListByQueues]: Freeswich agent list by queue. params: `, JSON.stringify(params));
            const fsResult = yield this.api(`callcenter_config queue list agents ${params.uuid}`);
            return this.freeswitchStringToArray(fsResult, '|').map((i) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
                return ({
                    name: (_a = i === null || i === void 0 ? void 0 : i.name) !== null && _a !== void 0 ? _a : '',
                    instanceId: (_b = i === null || i === void 0 ? void 0 : i.instanceId) !== null && _b !== void 0 ? _b : '',
                    uuid: (_c = i === null || i === void 0 ? void 0 : i.uuid) !== null && _c !== void 0 ? _c : '',
                    type: (_d = i === null || i === void 0 ? void 0 : i.type) !== null && _d !== void 0 ? _d : '',
                    contact: (_e = i === null || i === void 0 ? void 0 : i.contact) !== null && _e !== void 0 ? _e : '',
                    status: (_f = i === null || i === void 0 ? void 0 : i.status) !== null && _f !== void 0 ? _f : '',
                    state: (_g = i === null || i === void 0 ? void 0 : i.state) !== null && _g !== void 0 ? _g : '',
                    maxNoAnswer: (_h = Number(i === null || i === void 0 ? void 0 : i.maxNoAnswer)) !== null && _h !== void 0 ? _h : 0,
                    wrapUpTime: (_j = Number(i === null || i === void 0 ? void 0 : i.wrapUpTime)) !== null && _j !== void 0 ? _j : 0,
                    rejectDelayTime: (_k = Number(i === null || i === void 0 ? void 0 : i.rejectDelayTime)) !== null && _k !== void 0 ? _k : 0,
                    busyDelayTime: (_l = Number(i === null || i === void 0 ? void 0 : i.busyDelayTime)) !== null && _l !== void 0 ? _l : 0,
                    noAnswerDelayTime: (_m = Number(i === null || i === void 0 ? void 0 : i.noAnswerDelayTime)) !== null && _m !== void 0 ? _m : 0,
                    lastBridgeStart: (_o = Number(i === null || i === void 0 ? void 0 : i.lastBridgeStart)) !== null && _o !== void 0 ? _o : 0,
                    lastBridgeEnd: (_p = Number(i === null || i === void 0 ? void 0 : i.lastBridgeEnd)) !== null && _p !== void 0 ? _p : 0,
                    lastOfferedCall: (_q = Number(i === null || i === void 0 ? void 0 : i.lastOfferedCall)) !== null && _q !== void 0 ? _q : 0,
                    lastStatusChange: (_r = Number(i === null || i === void 0 ? void 0 : i.lastStatusChange)) !== null && _r !== void 0 ? _r : 0,
                    noAnswerCount: (_s = Number(i === null || i === void 0 ? void 0 : i.noAnswerCount)) !== null && _s !== void 0 ? _s : 0,
                    callsAnswered: (_t = Number(i === null || i === void 0 ? void 0 : i.callsAnswered)) !== null && _t !== void 0 ? _t : 0,
                    talkTime: (_u = Number(i === null || i === void 0 ? void 0 : i.talkTime)) !== null && _u !== void 0 ? _u : 0,
                    readyTime: (_v = Number(i === null || i === void 0 ? void 0 : i.readyTime)) !== null && _v !== void 0 ? _v : 0,
                    externalCallsCount: (_w = Number(i === null || i === void 0 ? void 0 : i.externalCallsCount)) !== null && _w !== void 0 ? _w : 0,
                });
            });
        });
    }
    callQueuesByQueueId(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][callQueuesByQueueId]: Freeswich get call queue. params: `, JSON.stringify(params));
            this.apis([`callcenter_config queue list members ${params.uuid}`]);
        });
    }
    agentTransfer(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setHost(params.serverIp);
            console.log(`[${this.className}][agentTransfer]: Freeswich agent call transfer FS record. params: `, JSON.stringify(params));
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
            this.apis([
                `uuid_transfer ${optionRecordUuid} ${optionBleg} ${optionTarget}`,
            ]);
        });
    }
}
exports.FreeSwitchEngine = FreeSwitchEngine;
