import speakeasy from "speakeasy";
import QRcode from "qrcode"
import PasswordHasher from "./passwordHasher.js";
import Dotenv from 'dotenv';
import JWT from "jsonwebtoken";

Dotenv.config();

class twoFA {
    static issuer = "gamepad";
    static appStep = 30; //30sec
    static emailStep = 900; //15min
    static client_id = process.env.CLIENT_ID;
    static client_secret = process.env.CLIENT_SECRET;
    static redirectURI = "http://127.0.0.1:3000/api/auth/google/callback";

    static validSerials = new Map();
    static timeOutStorage = new Map();

    static getSecret() {
        const issuer = this.issuer;
        const secret = speakeasy.generateSecret({issuer});

        return (secret.base32);
    }

    static  getEmailToken(secret) {
        const step = this.emailStep;
        const token = speakeasy.totp({secret, step});

        return (token);
    }

    static  getAppToken(secret) {
        const step = this.appStep;
        const token = speakeasy.totp({secret, step, encoding: 'base32'});

        return (token);
    }

    static getSerial(userid) {
        userid = String(userid);
        const secret = speakeasy.generateSecret({counter: 0}).base32;
        const token = speakeasy.hotp({secret, counter: 0, digits: 8});
        const hashed = new PasswordHasher("", 36).smartHash(token, secret);
        const serial = Buffer.from(hashed).toString("base64");

        clearTimeout(this.timeOutStorage.get(userid));
        this.validSerials.set(userid, serial);
        const interval = setTimeout(() => this.validSerials.delete(userid), 3600000);
        this.timeOutStorage.set(userid, interval);

        return (serial);
    }

    static  verifyToken(secret, token) {
        token = Number(token);
        const appCheck = speakeasy.totp.verify({secret, token, step: this.appStep, encoding: 'base32'});
        const emailCheck = speakeasy.totp.verify({secret, token, step: this.emailStep});

        return (appCheck || emailCheck);
    }

    static verifySerial(userid, serial, disableAfterVerify = true) {
        userid = String(userid);
        const validSerial = this.validSerials.get(userid);

        if (userid && serial && validSerial === serial) {
            if (disableAfterVerify) {
                this.validSerials.delete(userid);
                clearTimeout(this.timeOutStorage.get(userid));
                this.timeOutStorage.delete(userid);
            }
            return (true);
        }

        return (false);
    }

    static async generateQrCode(userid, secret, issuer = this.issuer) {
        const name = `(#${userid})`;
        const URL = `otpauth://totp/${encodeURIComponent(name)}` +
                    `?secret=${encodeURIComponent(secret)}`+
                    `&issuer=${encodeURIComponent(issuer)}`;

        return (await QRcode.toDataURL(URL));
    }

    static generateGoogleConsentURL(originURI) {
        const secret = this.getSecret();
        const serial = this.getSerial(secret);
        const state = JSON.stringify({ secret, serial, originURI});
        const scope = "openid email profile";

        const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${encodeURIComponent(this.client_id)}&` +
                    `redirect_uri=${encodeURIComponent(this.redirectURI)}&` +
                    `scope=${encodeURIComponent(scope)}&` +
                    `state=${encodeURIComponent(state)}&` +
                    `response_type=code`;
        
        return (url);
    }

    static async exchangeGoogleCode(code, state) {
        if (!state.length) return {};
        const serialData = JSON.parse(state);

        if (!this.verifySerial(serialData.secret, serialData.serial))
            return {};

        try {
            const payload = new URLSearchParams();

            payload.append("client_id", this.client_id);
            payload.append("client_secret", this.client_secret);
            payload.append("redirect_uri", this.redirectURI);
            payload.append("grant_type", "authorization_code");
            payload.append("code", code);
            const response = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: payload
            });

            const responseData = await response.json();
            const result = JWT.decode(responseData.id_token) || {};
            result.originURI = serialData.originURI;
            return (result);
        }
        catch {
            return {};
        }
    }
}

export default twoFA;