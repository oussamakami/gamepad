import UserData from "./userModule";
import FormHandler from "./formsModule";
import navigationHandler, {httpPromise} from "./browserModule";
import Chart from "./chartModule";

const user = new UserData("http://127.0.0.1:3000/api/sessionData", "http://127.0.0.1:3000/api/picture");
const navigation = new navigationHandler(user);

const signupForm = new FormHandler("signup-form", "POST","http://127.0.0.1:3000/api/signup");
const recoveryForm = new FormHandler("recovery-form", "POST", "http://127.0.0.1:3000/api/recovery");
const resetForm = new FormHandler("reset-form", "POST", "http://127.0.0.1:3000/api/pass_reset");
const twoFAForm = new FormHandler("twofa-form", "POST", "http://127.0.0.1:3000/api/twofa");
const loginForm = new FormHandler("login-form", "POST", "http://127.0.0.1:3000/api/login", (data: Record<string, any>) => {
    user.load(data);
    navigation.navigateTo("/dashboard");
});

function expiredNotice(formHander?: FormHandler): httpPromise {
    const url = new URLSearchParams(location.search);
    const expired = url.get("expired");

    if (expired)
        formHander?.showError("session expired");

    return Promise.resolve({httpCode: 200, httpName: "OK"});
}
function containsSerial(formHander?: FormHandler): httpPromise {
    const url = new URLSearchParams(location.search);
    const serial = url.get("serial");
    if (!serial)
        return Promise.reject({httpCode: 404, httpName: "page not found"});

    formHander?.addToPayload("serial", serial);
    return Promise.resolve({httpCode: 200, httpName: "OK"});
}

navigation.configure("top-nav", "side-nav", "error");
navigation.addAuthSection("/", "login", {formHander: loginForm, onload: expiredNotice});
navigation.addAuthSection("/login", "login", {formHander: loginForm, onload: expiredNotice});
navigation.addAuthSection("/signup", "signup", {formHander: signupForm});
navigation.addAuthSection("/recovery", "recovery", {formHander: recoveryForm});
navigation.addAuthSection("/reset", "reset", {formHander: resetForm, onload: containsSerial});
navigation.addAuthSection("/twofa", "twofa", {formHander: twoFAForm, onload: containsSerial});

navigation.addDashSection("/", "dashboard");
navigation.addDashSection("/dashboard", "dashboard");
navigation.addDashSection("/chat", "chat");
navigation.addDashSection("/friends", "friends");
navigation.addDashSection("/profile", "profile");
navigation.addDashSection("/pong", "pong");
navigation.addDashSection("/tic-tac", "tic-tac");
navigation.addDashSection("/rps", "rps");
navigation.addDashSection("/settings", "settings");

//this one for testing Unauthorized Access with session expiration
async function notauthorizedTesting(): httpPromise {
    try {
        const response = await fetch("http://127.0.0.1:3000/api/expired", {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok)
            throw new Error();
        return Promise.resolve({httpCode: 200, httpName: "OK"});
    } catch {
        return Promise.reject({httpCode: 401, httpName: "Unauthorized Access"});
    }
}

navigation.addDashSection("/expire", "chat", {onload: notauthorizedTesting})
//this one for testing Unauthorized Access with session expiration

navigation.initialize();