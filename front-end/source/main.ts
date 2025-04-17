import UserData from "./userModule";
import FormHandler from "./formsModule";
import DashboardLoader from "./dashboardModule";
import ProfileLoader from "./profileModule";
import navigationHandler, {httpPromise} from "./browserModule";

const user = new UserData("http://127.0.0.1:3000/api/sessionData", "http://127.0.0.1:3000/api/picture", "mode-toggle");
const dashboard = new DashboardLoader("http://127.0.0.1:3000/api/stats", "http://127.0.0.1:3000/api/picture");
const profile = new ProfileLoader("http://127.0.0.1:3000/api/users/", "http://127.0.0.1:3000/api/picture", user);
const navigation = new navigationHandler(user);

dashboard.setChartBarColors = ["--primary-brand-color"];
dashboard.setChartTextColor = "--primary-text-color";

profile.setChartBarColors = ["--primary-brand-color", "#4f55a6"];
profile.setChartTextColor = "--primary-text-color";

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

navigation.addDashSection("/", "dashboard", {onload: () => dashboard.load()});
navigation.addDashSection("/dashboard", "dashboard", {onload: () => dashboard.load()});
navigation.addDashSection("/chat", "chat");
navigation.addDashSection("/friends", "friends");
navigation.addDashSection("/profile", "profile", {onload: () => profile.load()});
navigation.addDashSection("/pong", "pong");
navigation.addDashSection("/tic-tac", "tic-tac");
navigation.addDashSection("/rps", "rps");
navigation.addDashSection("/settings", "settings");

navigation.initialize();