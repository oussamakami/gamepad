import speakeasy from "speakeasy";
import QRcode from "qrcode"
import PasswordHasher from "./passwordHasher.js";

class twoFA {
    static issuer = "gamepad";
    static appStep = 30; //30sec
    static emailStep = 900; //15min

    static usedSerials = new Set();

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

    static getSerial(userid, secret) {
        const token = speakeasy.totp({secret, step: 3600, digits: 8});
        const hashed = new PasswordHasher("", 36).smartHash(token, userid);

        return (Buffer.from(hashed).toString("base64"));
    }

    static  verifyToken(secret, token) {
        const appCheck = speakeasy.totp.verify({secret, token, step: this.appStep});
        const emailCheck = speakeasy.totp.verify({secret, token, step: this.emailStep});

        return (appCheck || emailCheck);
    }

    static verifySerial(userid, secret, serial, disableAfterVerify = true) {
        const validSerial = this.getSerial(userid, secret);

        if (validSerial === serial && !this.usedSerials.has(serial)) {
            if (disableAfterVerify) {
                this.usedSerials.add(serial);
                setTimeout(() => this.usedSerials.delete(serial), 3600000);
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