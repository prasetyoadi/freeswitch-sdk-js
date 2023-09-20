import FreeswichHelper from './helper';
import type {
  AgentListByQueueIdParamsType,
  AgentListByQueueIdResponseType,
  AgentTransferParamsType,
  BargeParamsType,
  BlindTransferParamsType,
  BridgeCallParamsType,
  CallQueuesByQueueIdParamsType,
  CoachParamsType,
  CreateDirectoryParamsType,
  DisplaceParamsType,
  HangupParamsType,
  HoldParamsType,
  LoginParamsType,
  LogoutParamsType,
  MonitorParamsType,
  RecordsParamsType,
  RegisterQueueParamsType,
  RemoveQueueParamsType,
  RequestSentimentAnalysisParamsType,
  SetStateParamsType,
  SetStatusParamsType,
  StopSentimentAnalysisParamsType,
} from './interface';
import { EnumDirection, EnumHold } from './interface';

const esl = require('modesl');

export class FreeSwitchEngine extends FreeswichHelper {
  private readonly defaultPortNumber: number = 8021;
  private readonly defaultPassword: string = 'ClueCon';
  private readonly className = FreeSwitchEngine.name;

  private host: string = '';
  private port: number = this.defaultPortNumber;
  private password: string = this.defaultPassword;

  private apis(commands: Array<string>): void {
    try {
      const conn = new esl.Connection(
        this.host,
        this.port,
        this.password,
        () => {
          if (conn.connected()) {
            // execute apis command
            commands.forEach((cmd: string) => {
              conn.api(cmd, (r: { body: string }) => {
                this.logCommand(cmd, r);
              });
            });
            conn.disconnect();
          }
        },
      );
    } catch {
      console.error(
        `[FreeSwitchEngine:apis] Fs can't connect to host ${this.host}`,
      );
    }
  }

  private api(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const conn = new esl.Connection(
          this.host,
          this.port,
          this.password,
          () => {
            if (conn.connected()) {
              // execute apis command
              conn.api(cmd, (r: { body: string }) => {
                this.logCommand(cmd, r);
                resolve(r.body);
              });
              conn.disconnect();
            }
          },
        );
      } catch {
        console.error(
          `[FreeSwitchEngine:api] Fs can't connect to host ${this.host}`,
        );
      }
    });
  }

  setHost(host: string): void {
    this.host = host;
  }

  setPort(port: number): void {
    this.port = port;
  }

  setPassword(password: string): void {
    this.password = password;
  }

  async logout(params: LogoutParamsType): Promise<void> {
    this.removeQueue(params);

    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][logout]: Freeswitch logout, params: `,
      JSON.stringify(params),
    );
    this.apis([`callcenter_config agent del ${params.uuid}`]);
  }

  async login(params: LoginParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][login]: Freeswitch login, params: `,
      JSON.stringify(params),
    );
    this.apis([
      `callcenter_config agent add ${params.uuid} callback`,
      `callcenter_config agent set contact ${params.uuid} user/${params.extension}@${params.sipUrl}`,
      `callcenter_config agent set status ${params.uuid} 'Logged Out'`,
    ]);
  }

  async removeQueue(params: RemoveQueueParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][removeQueue]: Freeswitch remove queue, params: `,
      JSON.stringify(params),
    );
    this.apis(
      params.queueIds.map(
        (queueId) => `callcenter_config tier del ${queueId} ${params.uuid}`,
      ),
    );
  }

  async registerQueue(params: RegisterQueueParamsType): Promise<void> {
    this.removeQueue({
      serverIp: params.serverIp,
      uuid: params.uuid,
      queueIds: params.existingQueueIds,
    });

    setTimeout(() => {
      this.setHost(params.serverIp);
      console.log(
        `[${this.className}][registerQueue]: Freeswitch register queue, params: `,
        JSON.stringify(params),
      );
      this.apis(
        params.queueIds.map(
          (queueId) =>
            `callcenter_config tier add ${queueId} ${params.uuid} 1 1`,
        ),
      );
    }, 500);
  }

  async setStatus(params: SetStatusParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][setStatus]: Freeswitch set status to ${params.status}, params: `,
      JSON.stringify(params),
    );
    this.apis([
      `callcenter_config agent set status ${params.uuid} '${params.status}'`,
    ]);
  }

  async setState(params: SetStateParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][setState]: Freeswitch set state to ${params.state}, params: `,
      JSON.stringify(params),
    );
    this.apis([
      `callcenter_config agent set state ${params.uuid} '${params.state}'`,
    ]);
  }

  async requestSentimentAnalysis(
    params: RequestSentimentAnalysisParamsType,
  ): Promise<void> {
    const { recordingId, serverIp, uuid } = params;
    this.setHost(serverIp);
    console.log(
      `[${this.className}][requestSentimentAnalysis]: Freeswitch sentiment analysis for call, params: `,
      JSON.stringify(params),
    );
    this.apis([
      `originate {origination_caller_id_number=12345,ignore_early_media=true}sofia/internal/1483#${recordingId}@${serverIp}&eavesdrop(${uuid})`,
    ]);
  }

  async stopSentimentAnalysis(
    params: StopSentimentAnalysisParamsType,
  ): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][stopSentimentAnalysis]: Stop sentiment analysis. params: `,
      JSON.stringify(params),
    );
    this.apis([`uuid_kill ${params.uuid}`]);
  }

  async bridgeCall(params: BridgeCallParamsType): Promise<void> {
    const {
      extension,
      callerId,
      destinationNumber,
      domainName,
      recordingId,
      serverIp,
    } = params;
    this.setHost(serverIp);
    console.log(
      `[${this.className}][bridgeCall]: Freeswich bridge. params: `,
      JSON.stringify(params),
    );
    this.apis([
      `originate {origination_caller_id_number=${callerId},origination_caller_id_name=DialerExternal#${domainName}#${recordingId}#${destinationNumber}#${callerId},ignore_early_media=true,call_timeout=60,hangup_after_bridge=true}sofia/internal/${extension}@${domainName} &bridge({origination_caller_id_name=DialerInternal#${recordingId}#${destinationNumber}}user/${extension}@${domainName}`,
    ]);
  }

  async createDirectory(params: CreateDirectoryParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][createDirectory]: Freeswitch Create Switch directory. params: `,
      JSON.stringify(params),
    );
    this.apis([`lua mkdir.lua ${params.directory}`]);
  }

  async records(params: RecordsParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][records]: Freeswitch ${params.action} recording. params: `,
      JSON.stringify(params),
    );
    this.apis([
      `uuid_record ${params.uuid} ${params.action} ${params.filePath}${params.fileName}`,
    ]);
  }

  async hangup(params: HangupParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][hangup]: Freeswitch kill uuid with params: `,
      JSON.stringify(params),
    );
    this.apis([`uuid_kill ${params.uuid}`]);
  }

  async hold(params: HoldParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][hold]: Freeswitch ${params.action} uuid with params: `,
      JSON.stringify(params),
    );
    this.apis([
      `uuid_hold ${params.action === EnumHold.UNHOLD && 'off'} ${params.uuid}`,
    ]);
  }

  async displace(params: DisplaceParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][displace]: Freeswitch displace. params: `,
      JSON.stringify(params),
    );
    const isHold = params.action === EnumHold.HOLD;
    const startOrStop = isHold ? 'start' : 'stop';
    const zeroLoop = isHold ? ' 0 loop' : '';
    this.apis([
      `uuid_displace ${params.uuid} ${startOrStop} ${params.displaceFile}${zeroLoop}`,
    ]);
  }

  async blindTransfer(params: BlindTransferParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][blindTransfer]: Freeswich blind transfer params: `,
      JSON.stringify(params),
    );
    const isIncoming = params.direction === EnumDirection.IN;
    this.apis([
      `uuid_transfer ${params.uuid} ${isIncoming && '-bleg '}${
        params.destinationNumber
      }`,
    ]);
  }

  async barge(params: BargeParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][barge]: Freeswich barge call. params: `,
      JSON.stringify(params),
    );
    this.apis([
      `originate user/${params.extension}@${params.sipUrl} 'queue_dtmf:w3@500,eavesdrop:${params.uuid}' inline`,
    ]);
  }

  async monitor(params: MonitorParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][monitor]: Freeswich monitor call. params: `,
      JSON.stringify(params),
    );
    this.apis([
      `originate user/${params.extension}@${params.sipUrl} &eavesdrop(${params.uuid})`,
    ]);
  }

  async coach(params: CoachParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][coach]: Freeswich coach call uuid: ${params.uuid}`,
    );
    const isIncoming = params.direction === EnumDirection.IN;
    const dtmfQueue = isIncoming ? 'w2@500' : 'w1@500';
    this.apis([
      `originate user/${params.extension}@${params.sipUrl} 'queue_dtmf:${dtmfQueue},eavesdrop:${params.uuid}' inline`,
    ]);
  }

  async agentListByQueues(
    params: AgentListByQueueIdParamsType,
  ): Promise<Array<AgentListByQueueIdResponseType>> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][agentListByQueues]: Freeswich agent list by queue. params: `,
      JSON.stringify(params),
    );

    const fsResult = await this.api(
      `callcenter_config queue list agents ${params.uuid}`,
    );

    return this.freeswitchStringToArray(fsResult, '|').map((i) => ({
      name: i?.name ?? '',
      instanceId: i?.instanceId ?? '',
      uuid: i?.uuid ?? '',
      type: i?.type ?? '',
      contact: i?.contact ?? '',
      status: i?.status ?? '',
      state: i?.state ?? '',
      maxNoAnswer: Number(i?.maxNoAnswer) ?? 0,
      wrapUpTime: Number(i?.wrapUpTime) ?? 0,
      rejectDelayTime: Number(i?.rejectDelayTime) ?? 0,
      busyDelayTime: Number(i?.busyDelayTime) ?? 0,
      noAnswerDelayTime: Number(i?.noAnswerDelayTime) ?? 0,
      lastBridgeStart: Number(i?.lastBridgeStart) ?? 0,
      lastBridgeEnd: Number(i?.lastBridgeEnd) ?? 0,
      lastOfferedCall: Number(i?.lastOfferedCall) ?? 0,
      lastStatusChange: Number(i?.lastStatusChange) ?? 0,
      noAnswerCount: Number(i?.noAnswerCount) ?? 0,
      callsAnswered: Number(i?.callsAnswered) ?? 0,
      talkTime: Number(i?.talkTime) ?? 0,
      readyTime: Number(i?.readyTime) ?? 0,
      externalCallsCount: Number(i?.externalCallsCount) ?? 0,
    }));
  }

  async callQueuesByQueueId(
    params: CallQueuesByQueueIdParamsType,
  ): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][callQueuesByQueueId]: Freeswich get call queue. params: `,
      JSON.stringify(params),
    );
    this.apis([`callcenter_config queue list members ${params.uuid}`]);
  }

  async agentTransfer(params: AgentTransferParamsType): Promise<void> {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][agentTransfer]: Freeswich agent call transfer FS record. params: `,
      JSON.stringify(params),
    );
    const isIncoming = params.direction === EnumDirection.IN;
    const isOutgoing = params.direction === EnumDirection.OUT;
    const isOriginallyOut = params.direction === EnumDirection.ORIGINALLY_OUT;

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
  }
}
