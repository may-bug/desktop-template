import { platform } from '@tauri-apps/plugin-os';
// when using `"withGlobalTauri": true`, you may use
// const { platform } = window.__TAURI__.os;

const currentPlatform = platform();
console.log(currentPlatform);
// Prints "windows" to the console