//@ts-nocheck
import { upload } from '@tauri-apps/plugin-upload';
// when using `"withGlobalTauri": true`, you may use
// const { upload } = window.__TAURI__.upload;

upload(
    'https://example.com/file-upload',
    './path/to/my/file.txt',
    ({ progress, total }) =>
        console.log(`Uploaded ${progress} of ${total} bytes`), // a callback that will be called with the upload progress
    { 'Content-Type': 'text/plain' } // optional headers to send with the request
);