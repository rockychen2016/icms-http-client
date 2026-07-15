import pino from "pino";
import PinoPretty from "pino-pretty";
// import koffi from 'koffi';

// if (typeof window === 'undefined' && process.platform === 'win32') {
//     try {
//         const CP_UTF8 = 65001;
//         const kernel32 = koffi.load('Kernel32');
//         const setConsoleOutputCP = kernel32.func('SetConsoleOutputCP', 'bool', ['int']);
//         const setConsoleCP = kernel32.func('SetConsoleCP', 'bool', ['int']);
//         setConsoleOutputCP(CP_UTF8);
//         setConsoleCP(CP_UTF8);
//     } catch (e) {
//         console.log(e);
//     }
// }

// export const logger = pino({
//     name: process.env.APP_NAME ?? 'iBoot',
//     level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
//     nestedKey: 'payload',
//     transport: {
//         target: 'pino-pretty',
//         options: {
//             colorize: true,
//             translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
//             ignore: 'pid,hostname',
//             messageFormat: '{msg}',
//             singleLine: true,
//         },
//     }
// });

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