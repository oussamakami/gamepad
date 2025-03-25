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
        return (typeof userName === "string") ? (userName.length >= 3 && userName.length <= 20) : false;
    }

    validatePassword(userPass) {
        return (typeof userPass === "string") ? userPass.length >= 8 : false;
    }

    validateIdentifier(userIdentifier){
        return (typeof userIdentifier === "string") ? userIdentifier.length >= 3 : false;
    }
}

export default new inputValidator();