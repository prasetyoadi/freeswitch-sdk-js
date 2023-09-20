"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const camelCase_1 = __importDefault(require("lodash/camelCase"));
const zipObject_1 = __importDefault(require("lodash/zipObject"));
class FreeswichHelper {
    constructor() {
        this.resOk = '+OK';
    }
    trimUpperValue(value) {
        return value.toUpperCase().trim();
    }
    freeswitchStringToArray(value, delimiter) {
        const splitArray = value.split('\n');
        const firstElement = splitArray[0];
        let result = [];
        let initialFields = [];
        if (this.trimUpperValue(firstElement) !== this.resOk) {
            splitArray
                .filter((row) => row !== this.resOk)
                .forEach((row, index) => {
                const arrList = row.split(delimiter);
                if (index === 0) {
                    initialFields = [...arrList.map((field) => (0, camelCase_1.default)(field))];
                }
                else {
                    result.push((0, zipObject_1.default)([...initialFields], arrList));
                }
            });
        }
        return result;
    }
    logCommand(cmd, res) {
        if (res)
            console.log(`[${FreeswichHelper.name}] Command "api ${cmd}" | Result "${res.body.trim()}\n\n"`);
        else
            console.log(`[${FreeswichHelper.name}] Command "api ${cmd}\n\n"`);
    }
}
exports.default = FreeswichHelper;
