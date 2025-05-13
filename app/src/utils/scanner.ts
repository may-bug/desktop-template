//@ts-nocheck
import { scan, Format } from '@tauri-apps/plugin-barcode-scanner';
// when using `"withGlobalTauri": true`, you may use
// const { scan, Format } = window.__TAURI__.barcodeScanner;

// `windowed: true` actually sets the webview to transparent
// instead of opening a separate view for the camera
// make sure your user interface is ready to show what is underneath with a transparent element
scan({windowed: true, formats: [Format.QRCode]}).then(r =>{});