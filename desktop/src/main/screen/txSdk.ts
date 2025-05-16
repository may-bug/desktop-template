import TRTCCloud from 'trtc-electron-sdk'

const rtcCloud: TRTCCloud = TRTCCloud.getTRTCShareInstance()
// 获取 SDK 版本号
const version: string = rtcCloud.getSDKVersion()
