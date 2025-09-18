class inputValidator {
    constructor(){}

    normalizeEmail(userEmail) {
        return (typeof userEmail === "string") ? userEmail.toLowerCase() : undefined;
    }

    validateEmail(userEmail)
    {
        const emailRegex = /^(?!.*\.\.)[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

        return (typeof userEmail === "string") ? emailRegex.test(userEmail) : false;
    }

    validateUserName(userName){
        const usernameRegex = /^[^\s]{3,20}$/;

        return (typeof userName === "string") ? usernameRegex.test(userName) : false;
    }

    validatePassword(userPass) {
        return (typeof userPass === "string") ? userPass.length >= 8 : false;
    }

    validateIdentifier(userIdentifier) {
        return (typeof userIdentifier === "string") ? userIdentifier.length >= 3 : false;
    }
}

export default new inputValidator();