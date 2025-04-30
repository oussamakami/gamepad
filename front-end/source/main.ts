import UserData from "./userModule";
import FormHandler from "./formsModule";
import DashboardLoader from "./dashboardModule";
import ProfileLoader from "./profileModule";
import NavigationHandler, {httpPromise} from "./browserModule";
import NavBarHandler from "./navBarModule";
import SearchLoader from "./searchModule";
import FriendsLoader from "./friendsModule";
import ChatLoader from "./chatModule";
import SocketHandler from "./SocketModule";

function loadUserData(data) {
    if (data.redirectTo) {
        NAVIGATION.navigateTo(data.redirectTo);
        return ;
    }
    USER.load(data);
    SOCKET.connect();
    NAVIGATION.navigateTo("/dashboard");
}

function expiredNotice(formHander?: FormHandler): httpPromise {
    const url = new URLSearchParams(location.search);
    const expired = url.get("expired");

    if (expired)
        formHander?.showError("session expired");

    return Promise.resolve({httpCode: 200, httpName: "OK"});
}
async function containsSerial(formHander?: FormHandler): httpPromise {
    const url = new URLSearchParams(location.search);
    const userid = url.get("id") || "";
    const serial = url.get("serial") || "";
    const remember = url.get("remember") || 0;

    const response = await fetch("http://127.0.0.1:3000/api/auth/verifyserial"+location.search);

    if (!response.ok)
        return Promise.reject({httpCode: 404, httpName: "page not found"});

    formHander?.addToPayload("userid", userid);
    formHander?.addToPayload("serial", serial);
    formHander?.addToPayload("remember", String(remember));
    return Promise.resolve({httpCode: 200, httpName: "OK"});
}


const API_BASE   = "http://127.0.0.1:3000/api";

const USER       = new UserData(API_BASE);
const SOCKET     = new SocketHandler("ws://127.0.0.1:3000/api/websocket", USER);
const NAVIGATION = new NavigationHandler(USER);
const DASHBOARD  = new DashboardLoader(API_BASE, NAVIGATION);
const PROFILE    = new ProfileLoader(API_BASE, NAVIGATION);
const NAVBAR     = new NavBarHandler(API_BASE, NAVIGATION);
const SEARCH     = new SearchLoader(API_BASE);
const FRIENDS    = new FriendsLoader(API_BASE);
const CHAT       = new ChatLoader(API_BASE);

const FORMS = {
    TWOFA  : new FormHandler("twofa-form",    `${API_BASE}/auth/twofa`, loadUserData),
    RESET  : new FormHandler("reset-form",    `${API_BASE}/auth/resetpass`, loadUserData),
    LOGIN  : new FormHandler("login-form",    `${API_BASE}/auth/login`, loadUserData),
    SIGNUP : new FormHandler("signup-form",   `${API_BASE}/auth/signup`),
    RECOVER: new FormHandler("recovery-form", `${API_BASE}/auth/recovery`)
}

const AUTHSECTIONS = [
    {path: "/",        view: "login",    options: {formHander: FORMS.LOGIN,   onload: expiredNotice}},
    {path: "/login",   view: "login",    options: {formHander: FORMS.LOGIN,   onload: expiredNotice}},
    {path: "/reset",   view: "reset",    options: {formHander: FORMS.RESET,   onload: containsSerial}},
    {path: "/twofa",   view: "twofa",    options: {formHander: FORMS.TWOFA,   onload: containsSerial}},
    {path: "/signup",  view: "signup",   options: {formHander: FORMS.SIGNUP   }},
    {path: "/recover", view: "recovery", options: {formHander: FORMS.RECOVER  }}
]
const DASHSECTIONS = [
    {path: "/",          view: "dashboard", options: {onload: () => DASHBOARD.load()}},
    {path: "/dashboard", view: "dashboard", options: {onload: () => DASHBOARD.load()}},
    {path: "/profile",   view: "profile",   options: {onload: () => PROFILE.load()}},
    {path: "/search",    view: "search",    options: {onload: () => SEARCH.load()}},
    {path: "/friends",   view: "friends",   options: {onload: () => FRIENDS.load()}},
    {path: "/chat",      view: "chat",      options: {onload: () => CHAT.load()}},
    {path: "/settings",  view: "settings",  options: {}},
    {path: "/pong",      view: "pong",      options: {}},
    {path: "/tictac",    view: "tic-tac",   options: {}},
    {path: "/rps",       view: "rps",       options: {}},
]

DASHBOARD.setChartTextColor = "--primary-text-color";
DASHBOARD.setChartBarColors = ["--primary-brand-color"];
PROFILE.setChartTextColor = "--primary-text-color";
PROFILE.setChartBarColors = ["--primary-brand-color", "#4f55a6"];

AUTHSECTIONS.forEach(section => NAVIGATION.addAuthSection(section.path, section.view, section.options));
DASHSECTIONS.forEach(section => NAVIGATION.addDashSection(section.path, section.view, section.options));

SOCKET.connect();
NAVIGATION.configure("top-nav", "side-nav", "error");
NAVIGATION.initialize();