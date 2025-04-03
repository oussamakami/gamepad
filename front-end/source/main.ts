import UserData from "./userModule";
import FormHandler from "./formsModule";
import navigationHandler, {httpPromise} from "./browserModule";

const user = new UserData("http://127.0.0.1:3000/api/sessionData");
const navigation = new navigationHandler(user);

const signupForm = new FormHandler("signup-form", "POST","http://127.0.0.1:3000/api/signup");
const recoveryForm = new FormHandler("recovery-form", "POST", "http://127.0.0.1:3000/api/recovery");
const resetForm = new FormHandler("reset-form", "POST", "http://127.0.0.1:3000/api/pass_reset");
const twoFAForm = new FormHandler("twofa-form", "POST", "http://127.0.0.1:3000/api/twofa");
const loginForm = new FormHandler("login-form", "POST", "http://127.0.0.1:3000/api/login", (data: Record<string, any>) => {
    user.load(data);
    navigation.navigateTo("/dashboard");
});


function containsSerial(): httpPromise {
    if (location.search.includes("serial="))
        return Promise.resolve({httpCode: 200, httpName: "OK"});
    return Promise.reject({httpCode: 404, httpName: "page not found"});
}

navigation.configure("top-nav", "side-nav", "error");
navigation.addAuthSection("/", "login", {formHander: loginForm});
navigation.addAuthSection("/login", "login", {formHander: loginForm});
navigation.addAuthSection("/signup", "signup", {formHander: signupForm});
navigation.addAuthSection("/recovery", "recovery", {formHander: recoveryForm});
navigation.addAuthSection("/reset", "reset", {formHander: resetForm, onload: containsSerial});
navigation.addAuthSection("/twofa", "twofa", {formHander: twoFAForm, onload: containsSerial});

navigation.addDashSection("/", "dashboard");
navigation.addDashSection("/dashboard", "dashboard");
navigation.addDashSection("/profile", "profile");
navigation.addDashSection("/settings", "settings");
navigation.addDashSection("/chat", "chat");

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