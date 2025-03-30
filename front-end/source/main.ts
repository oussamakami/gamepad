import formHandler from "./formsModule"
import navigationHandler from "./browserModule";

const loginForm = new formHandler("login-form", "POST", "http://127.0.0.1:3000/api/login");
const signupForm = new formHandler("signup-form", "POST","http://127.0.0.1:3000/api/signup");
const recoveryForm = new formHandler("recovery-form", "POST", "http://127.0.0.1:3000/api/recovery");
const resetForm = new formHandler("reset-form", "POST", "http://127.0.0.1:3000/api/pass_reset");
const twoFAForm = new formHandler("twofa-form", "POST", "http://127.0.0.1:3000/api/twofa");