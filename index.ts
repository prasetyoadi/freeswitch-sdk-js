import {
  AgentListByQueueIdParamsType,
  AgentTransferParamsType,
  BargeParamsType,
  BlindTransferParamsType,
  BridgeCallParamsType,
  CallQueuesByQueueIdParamsType,
  CoachParamsType,
  CreateDirectoryParamsType,
  DisplaceParamsType,
  EnumDirection,
  EnumHold,
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

const esl = require('modesl');

export class FreeSwitchEngine {
  private readonly defaultPortNumber: number = 8021;
  private readonly defaultPassword: string = 'ClueCon';
  private readonly className = FreeSwitchEngine.name;

  private host: string = '';
  private port: number = this.defaultPortNumber;
  private password: string = this.defaultPassword;

  private logCommand(cmd: string, res?: { body: string }): void {
    if (res)
      console.log(
        `[${
          this.className
        }] Command "api ${cmd}" | Result "${res.body.trim()}"`,
      );
    else console.log(`[${this.className}] Command "api ${cmd}"`);
  }

  private api(commands: Array<string>): void {
    const conn = new esl.Connection(this.host, this.port, this.password, () => {
      if (conn.connected()) {
        // execute apis command
        commands.forEach((cmd: string) => {
          conn.api(cmd, (r: { body: string }) => {
            this.logCommand(cmd, r);
          });
        });
        conn.disconnect();
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

  logout(params: LogoutParamsType): void {
    this.removeQueue(params);

    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][logout]: Freeswitch logout, params: `,
      JSON.stringify(params),
    );
    this.api([`callcenter_config agent del ${params.uuid}`]);
  }

  login(params: LoginParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][login]: Freeswitch login, params: `,
      JSON.stringify(params),
    );
    this.api([
      `callcenter_config agent add ${params.uuid} callback`,
      `callcenter_config agent set contact ${params.uuid} user/${params.extension}@${params.sipUrl}`,
      `callcenter_config agent set status ${params.uuid} 'Logged Out'`,
    ]);
  }

  removeQueue(params: RemoveQueueParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][removeQueue]: Freeswitch remove queue, params: `,
      JSON.stringify(params),
    );
    this.api(
      params.queueIds.map(
        (queueId) => `callcenter_config tier del ${queueId} ${params.uuid}`,
      ),
    );
  }

  registerQueue(params: RegisterQueueParamsType): void {
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
      this.api(
        params.queueIds.map(
          (queueId) =>
            `callcenter_config tier add ${queueId} ${params.uuid} 1 1`,
        ),
      );
    }, 500);
  }

  setStatus(params: SetStatusParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][setStatus]: Freeswitch set status to ${params.status}, params: `,
      JSON.stringify(params),
    );
    this.api([
      `callcenter_config agent set status ${params.uuid} ${params.status}`,
    ]);
  }

  setState(params: SetStateParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][setState]: Freeswitch set state to ${params.state}, params: `,
      JSON.stringify(params),
    );
    this.api([
      `callcenter_config agent set state ${params.uuid} ${params.state}`,
    ]);
  }

  requestSentimentAnalysis(params: RequestSentimentAnalysisParamsType): void {
    const { recordingId, serverIp, uuid } = params;
    this.setHost(serverIp);
    console.log(
      `[${this.className}][requestSentimentAnalysis]: Freeswitch sentiment analysis for call, params: `,
      JSON.stringify(params),
    );
    this.api([
      `originate {origination_caller_id_number=12345,ignore_early_media=true}sofia/internal/1483#${recordingId}@${serverIp}&eavesdrop(${uuid})`,
    ]);
  }

  stopSentimentAnalysis(params: StopSentimentAnalysisParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][stopSentimentAnalysis]: Stop sentiment analysis. params: `,
      JSON.stringify(params),
    );
    this.api([`uuid_kill ${params.uuid}`]);
  }

  bridgeCall(params: BridgeCallParamsType): void {
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
    this.api([
      `originate {origination_caller_id_number=${callerId},origination_caller_id_name=DialerExternal#${domainName}#${recordingId}#${destinationNumber}#${callerId},ignore_early_media=true,call_timeout=60,hangup_after_bridge=true}sofia/internal/${extension}@${domainName} &bridge({origination_caller_id_name=DialerInternal#${recordingId}#${destinationNumber}}user/${extension}@${domainName}`,
    ]);
  }

  createDirectory(params: CreateDirectoryParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][createDirectory]: Freeswitch Create Switch directory. params: `,
      JSON.stringify(params),
    );
    this.api([`lua mkdir.lua ${params.directory}`]);
  }

  records(params: RecordsParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][records]: Freeswitch ${params.action} recording. params: `,
      JSON.stringify(params),
    );
    this.api([
      `uuid_record ${params.uuid} ${params.action} ${params.filePath}${params.fileName}`,
    ]);
  }

  hangup(params: HangupParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][hangup]: Freeswitch kill uuid with params: `,
      JSON.stringify(params),
    );
    this.api([`uuid_kill ${params.uuid}`]);
  }

  hold(params: HoldParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][hold]: Freeswitch ${params.action} uuid with params: `,
      JSON.stringify(params),
    );
    this.api([
      `uuid_hold ${params.action === EnumHold.UNHOLD && 'off'} ${params.uuid}`,
    ]);
  }

  displace(params: DisplaceParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][displace]: Freeswitch displace. params: `,
      JSON.stringify(params),
    );
    const isHold = params.action === EnumHold.HOLD;
    const startOrStop = isHold ? 'start' : 'stop';
    const zeroLoop = isHold ? ' 0 loop' : '';
    this.api([
      `uuid_displace ${params.uuid} ${startOrStop} ${params.displaceFile}${zeroLoop}`,
    ]);
  }

  blindTransfer(params: BlindTransferParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][blindTransfer]: Freeswich blind transfer params: `,
      JSON.stringify(params),
    );
    const isIncoming = params.direction === EnumDirection.IN;
    this.api([
      `uuid_transfer ${params.uuid} ${isIncoming && '-bleg '}${
        params.destinationNumber
      }`,
    ]);
  }

  barge(params: BargeParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][barge]: Freeswich barge call. params: `,
      JSON.stringify(params),
    );
    this.api([
      `originate user/${params.extension}@${params.sipUrl} 'queue_dtmf:w3@500,eavesdrop:${params.uuid}' inline`,
    ]);
  }

  monitor(params: MonitorParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][monitor]: Freeswich monitor call. params: `,
      JSON.stringify(params),
    );
    this.api([
      `originate user/${params.extension}@${params.sipUrl} &eavesdrop(${params.uuid})`,
    ]);
  }

  coach(params: CoachParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][coach]: Freeswich coach call uuid: ${params.uuid}`,
    );
    const isIncoming = params.direction === EnumDirection.IN;
    const dtmfQueue = isIncoming ? 'w2@500' : 'w1@500';
    this.api([
      `originate user/${params.extension}@${params.sipUrl} 'queue_dtmf:${dtmfQueue},eavesdrop:${params.uuid}' inline`,
    ]);
  }

  agentListByQueues(params: AgentListByQueueIdParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][agentListByQueues]: Freeswich agent list by queue. params: `,
      JSON.stringify(params),
    );
    this.api([`callcenter_config queue list agents ${params.uuid}`]);
  }

  callQueuesByQueueId(params: CallQueuesByQueueIdParamsType): void {
    this.setHost(params.serverIp);
    console.log(
      `[${this.className}][callQueuesByQueueId]: Freeswich get call queue. params: `,
      JSON.stringify(params),
    );
    this.api([`callcenter_config queue list members ${params.uuid}`]);
  }

  agentTransfer(params: AgentTransferParamsType): void {
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

    this.api([
      `uuid_transfer ${optionRecordUuid} ${optionBleg} ${optionTarget}`,
    ]);
  }
}
