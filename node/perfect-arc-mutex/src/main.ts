import { ArcMutex } from "./index.js";

(async() => {
    console.log("before connect");
    const am = await new ArcMutex("sample").connect();
    console.log(am.id);
})();