import formHandler from "./formsModule"
import navigationHandler from "./browserModule";

const loginForm = new formHandler("login-form", "POST", "http://127.0.0.1:3000/api/login");
const signupForm = new formHandler("signup-form", "POST","http://127.0.0.1:3000/api/signup");
const recoveryForm = new formHandler("recovery-form", "POST", "http://127.0.0.1:3000/api/recovery");
const resetForm = new formHandler("reset-form", "POST", "http://127.0.0.1:3000/api/pass_reset");
const twoFAForm = new formHandler("twofa-form", "POST", "http://127.0.0.1:3000/api/twofa");

const navigation = new navigationHandler;

navigation.addAuthSection("/", "login");
navigation.addAuthSection("/login", "login");
navigation.addAuthSection("/signup", "signup");
navigation.addAuthSection("/recovery", "recovery");
navigation.addAuthSection("/reset", "reset");
navigation.addAuthSection("/twofa", "twofa");

navigation.addDashSection("/", "dashboard");
navigation.addDashSection("/dashboard", "dashboard");
navigation.addDashSection("/friends", "friends");
navigation.addDashSection("/search", "search");
navigation.addDashSection("/profile", "profile");
navigation.addDashSection("/chat", "chat");

navigation.setMainNavigation("top-nav");
navigation.setSecondaryNavigation("side-nav")
navigation.setErrorsection("error");

navigation.init();