import "./assets/style/theme.scss"
import { createApp } from "vue";
import App from "./App.vue";
import pinia from "./stores"
import {router} from "./router";
import {init} from "./lib/ininApp"

const app=createApp(App)
app.use(router)
app.use(pinia)
init(app)
app.mount("#app");
