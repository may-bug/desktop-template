// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
import {sendControlRequest} from "./useMessage.ts";
import {router} from "../router";
import {useDataStore} from "../stores/useDataStore.ts";

const dataStore = useDataStore();
const connectToDevice = (val) => {
    sendControlRequest({
        type:"request",
        from:dataStore.deviceId,
        to: val,
        password: null,
    })
    router.push('/desktop/loading')
}

export {
    connectToDevice,
}