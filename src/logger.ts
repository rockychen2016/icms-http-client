import pino from "pino";
import PinoPretty from "pino-pretty";

const stream = PinoPretty({
    colorize: true,
    destination: process.stdout,
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    ignore: 'pid,hostname',
    messageFormat: '{msg}',
    singleLine: true,
});

export const logger = pino({
    name: process.env.APP_NAME ?? 'iBoot',
    level: process.env.APP_ENV === 'production' ? 'info' : 'debug',
    nestedKey: 'payload'
}, stream);