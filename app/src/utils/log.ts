//@ts-nocheck
import {
    warn,
    debug,
    trace,
    info,
    error,
    attachConsole,
    attachLogger,
} from '@tauri-apps/plugin-log';
// when using `"withGlobalTauri": true`, you may use
// const { warn, debug, trace, info, error, attachConsole, attachLogger } = window.__TAURI__.log;

const log = {
    debug,
    warn,
    trace,
    info,
    error,
    attachConsole,
    attachLogger,
}