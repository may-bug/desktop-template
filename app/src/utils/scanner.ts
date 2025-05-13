//@ts-nocheck
import { scan, Format } from '@tauri-apps/plugin-barcode-scanner';

const scanQR=()=>{
    return scan({windowed: true, formats: [Format.QRCode]})
}
export {
    scanQR
}