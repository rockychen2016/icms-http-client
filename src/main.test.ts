import pino from "pino";
import PinoPretty from "pino-pretty";


//const fileName = new Date().toISOString().split('T')[0] + '.log';

const consoleStream = PinoPretty({
    colorize: true,
    destination: process.stdout,
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    ignore: 'pid,hostname',
    messageFormat: '{msg}',
    singleLine: true,
});

export const logger = pino({
    name: 'iBoot',
    level: 'debug',
    nestedKey: 'payload'
}, consoleStream);

const model = {
    data: "你好",
    code: 1,
    success: true,
}
logger.info(model, "result >>> ")
logger.debug(model)

logger.error(model, "error>>>")


const type = "content-type"
const headers: Record<string, string> = {};
headers[type] = "application/json"
logger.info(headers);


const map1 = {};

const map2 = {
    "login": "login"
}

const APIMAP = { ...map2, ...map1 };

logger.info(APIMAP, "apiMAP");


export const urlEncode = (value: string | null | undefined): string => {
    if (!value || value == "" || value.length == 0) {
        return "";
    }
    return (
        encodeURIComponent(value)
            // .replace(/%20/g, '+')
            // .replace(/%2B/g, '\\+')
            .replace(/\(/g, "%28") 
            .replace(/\)/g, "%29")
            .replace(/\'/g, "%27")
            .replace(/\!/g, "%21")
            .replace(/\~/g, "%7E")
    );
};
const str = "szygnet@qq.com";

logger.info({ "str": encodeURIComponent(str), "=": urlEncode(str) == encodeURIComponent(str) })
