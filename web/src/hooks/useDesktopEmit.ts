// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
import {sendControlRequest} from "./useMessage.ts";
import {router} from "../router";
import {useDataStore} from "../stores/useDataStore.ts";
import emit from "./useEmit.ts";

const dataStore = useDataStore();
const connectToDevice = () => {
    sendControlRequest({
        type:"request",
        from:dataStore.deviceId,
        to: dataStore.toDeviceId,
        password: null,
    })
    router.push('/desktop/loading')
}

const eventHandel=(val)=>{
    if(val.type=="reuse"){
        connectToDevice()
    }
}
emit.on('desktop', eventHandel);

export {
    connectToDevice,
}