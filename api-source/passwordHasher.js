class PasswordHasher {
    constructor(hashPrefix, outputLength) {
        this.hashPrefix = hashPrefix;
        this.outputLength = outputLength - hashPrefix.length;
    }

    #generateHashKey(character, seed) {
        let result = "";

        if (typeof character !== "string" || character.length === 0) {
            throw new Error("character must be a non-empty");
        }

        if (typeof seed === "string") {
            seed = Array.from(seed).reduce((total, char, index) => 
                total + char.charCodeAt(0) * (index + 1), 0);
        }

        for (let index = 1; index <= 4; index++) {
            let step = Math.abs(Math.floor((seed * 2) + seed) / index) - character.charCodeAt(0) + 26;

            if (index % 2)
                step += Math.floor(seed / 3) - index;
            else
                step -= Math.floor(seed / 3) + index;

            step = ((step % 60 + 59) % 53) + 33;
            result += String.fromCharCode(step);
        }
        
        return (result);
    }

    #generateDynamicSalt(password, seed) {
        return (this.#generateHashKey(password[0], seed.toString()) + this.#generateHashKey(password[0], password + seed.toString()));
    }

    saltPassword(password, salt = "00", saltInterval = 2) {
        let result = "";

        if (typeof password !== "string" || password.length === 0) {
            throw new Error("password must be a non-empty");
        }
        if (saltInterval >= password.length || saltInterval <= 0)
            saltInterval = 1;

        for (let i = 0; i < password.length; i++) {
            if (i % saltInterval === 0)
                result += salt;

            result += password[i];
        }

        return (result);
    }

    smartSaltPassword(password, seed) {
        return (this.saltPassword(password, this.#generateDynamicSalt(password, seed), 1));
    }

    #selectFromHash(hash, targetLength) {
        let result = "";

        for (let index = 0; result.length < targetLength; index++) {
            if (index % 2)
                result += (hash[index]);
        }

        return (result);
    }

    hash(password, salt="00", saltInterval=2) {
        let result = "";
        password = this.saltPassword(password, salt, saltInterval);

        for (let index = 0; index < password.length; index++)
            result += this.#generateHashKey(password[index], (password.length - index) * 2);

        while (result.length <= this.outputLength * 2)
            result += this.#generateHashKey(password[0], result.length);
        return (this.hashPrefix + this.#selectFromHash(result, this.outputLength));
    }

    smartHash(password, userId) {
        if (typeof password !== "string" || password.length === 0) {
            throw new Error("password must be a non-empty");
        }

        password = this.saltPassword(password, userId.toString(), 1);
        password = this.hash(password, this.#generateDynamicSalt(password, userId));

        return(password);
    }
}

export default PasswordHasher;