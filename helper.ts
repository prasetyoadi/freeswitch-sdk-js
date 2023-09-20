import camelCase from 'lodash/camelCase';
import zipObject from 'lodash/zipObject';
import type { AgentListByQueueIdFsResponseType } from './interface';

export default class FreeswichHelper {
  private readonly resOk = '+OK';

  trimUpperValue(value: string): string {
    return value.toUpperCase().trim();
  }

  freeswitchStringToArray(value: string, delimiter: string) {
    const splitArray = value.split('\n');
    const firstElement = splitArray[0];
    let result: Array<AgentListByQueueIdFsResponseType> = [];
    let initialFields: Array<string> = [];

    if (this.trimUpperValue(firstElement) !== this.resOk) {
      splitArray
        .filter((row) => row !== this.resOk)
        .forEach((row, index: number) => {
          const arrList = row.split(delimiter);
          if (index === 0) {
            initialFields = [...arrList.map((field) => camelCase(field))];
          } else {
            result.push(zipObject([...initialFields], arrList));
          }
        });
    }

    return result;
  }

  logCommand(cmd: string, res?: { body: string }): void {
    if (res)
      console.log(
        `[${
          FreeswichHelper.name
        }] Command "api ${cmd}" | Result "${res.body.trim()}\n\n"`,
      );
    else console.log(`[${FreeswichHelper.name}] Command "api ${cmd}\n\n"`);
  }
}
