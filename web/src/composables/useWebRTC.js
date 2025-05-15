import { ref, onBeforeUnmount } from 'vue';
import {WebRTCDataChannel} from "./useDataWebRTC.js";

export function useWebRTC() {
    const webrtc = ref(null);
    const connected = ref(false);
    const currentPeer = ref('');
    const currentCallType = ref('');
    const incomingCall = ref(null);
    const receivedMessages = ref([]);
    const localStream = ref(null);
    const remoteStream = ref(null);
    const muted = ref(false);
    const videoOff = ref(false);

    const init = (isInitiator, callType) => {
        webrtc.value = new WebRTCDataChannel();
        currentCallType.value = callType;

        webrtc.value.init(isInitiator);

        webrtc.value.on('open', () => {
            connected.value = true;
        });

        webrtc.value.on('close', () => {
            connected.value = false;
            cleanup();
        });

        webrtc.value.on('error', (error) => {
            console.error('WebRTC error:', error);
            cleanup();
        });

        webrtc.value.on('message', (message) => {
            receivedMessages.value.push(message);
        });

        webrtc.value.on('stream', (stream) => {
            remoteStream.value = stream;
        });

        webrtc.value.on('icecandidate', (candidate) => {
            // 需要在外部通过 sendSignal 发送 ICE candidate
        });

        if (isInitiator) {
            webrtc.value.on('offerCreated', (offer) => {
                // 需要在外部通过 sendSignal 发送 offer
            });
        }

        return webrtc.value;
    };

    const setupMedia = async (callType) => {
        try {
            const constraints = {
                audio: true,
                video: callType === 'video' ? {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                } : false
            };

            localStream.value = await navigator.mediaDevices.getUserMedia(constraints);

            // 添加轨道到连接
            localStream.value.getTracks().forEach(track => {
                webrtc.value.peerConnection.addTrack(track, localStream.value);
            });

            return localStream.value;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    };

    const sendMessage = (text, sender) => {
        if (!webrtc.value || !connected.value) return;

        const message = {
            text,
            sender,
            timestamp: new Date().toISOString()
        };

        webrtc.value.send(message);
        receivedMessages.value.push(message);
    };

    const toggleMute = () => {
        if (localStream.value) {
            localStream.value.getAudioTracks().forEach(track => {
                track.enabled = muted.value;
            });
            muted.value = !muted.value;
        }
    };

    const toggleVideo = () => {
        if (localStream.value) {
            localStream.value.getVideoTracks().forEach(track => {
                track.enabled = videoOff.value;
            });
            videoOff.value = !videoOff.value;
        }
    };

    const cleanup = () => {
        if (localStream.value) {
            localStream.value.getTracks().forEach(track => track.stop());
            localStream.value = null;
        }

        if (remoteStream.value) {
            remoteStream.value.getTracks().forEach(track => track.stop());
            remoteStream.value = null;
        }

        if (webrtc.value) {
            webrtc.value.close();
            webrtc.value = null;
        }

        connected.value = false;
        currentPeer.value = '';
        currentCallType.value = '';
    };

    onBeforeUnmount(() => {
        cleanup();
    });

    return {
        webrtc,
        connected,
        currentPeer,
        currentCallType,
        incomingCall,
        receivedMessages,
        localStream,
        remoteStream,
        muted,
        videoOff,
        init,
        setupMedia,
        sendMessage,
        toggleMute,
        toggleVideo,
        cleanup
    };
}