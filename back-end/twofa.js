import speakeasy from "speakeasy";
import QRcode from "qrcode"
import PasswordHasher from "./passwordHasher.js";

class twoFA {
    static issuer = "gamepad";
    static appStep = 30; //30sec
    static emailStep = 900; //15min

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
        const token = speakeasy.totp({secret, step});

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
        const appCheck = speakeasy.totp.verify({secret, token, step: this.appStep});
        const emailCheck = speakeasy.totp.verify({secret, token, step: this.emailStep});

        return (appCheck || emailCheck);
    }

    static verifySerial(userid, serial, disableAfterVerify = true) {
        userid = String(userid);
        const validSerial = this.validSerials.get(userid);

        if (validSerial === serial) {
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
}

export default twoFA;