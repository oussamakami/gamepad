import { faker } from '@faker-js/faker';

class RecordGenerator {
    #database;
    #users = [];
    #gameTypes = ["ping-pong", "tic-tac-toe", "rock-paper"];

    constructor (database) {
        if (!database || typeof database.createUser !== 'function' || typeof database.addGameRecord !== 'function') {
            throw new Error('Invalid database object provided');
        }

        this.#database = database;
    }

    #generateUsers(numberOfUsers) {
        for (let i = 0; i < numberOfUsers; i++) {
            const username = faker.person.firstName();
            const email = faker.internet.email();
            const password = faker.internet.password();
            
            const user = this.#database.createUser(username, email, password);
            this.#users.push(user.data);
        }
    }

    #selectRandomPlayers() {
        let winnerIndex = Math.floor(Math.random() * this.#users.length);
        let loserIndex = Math.floor(Math.random() * this.#users.length);
        
        while (loserIndex === winnerIndex) {
            loserIndex = Math.floor(Math.random() * this.#users.length);
        }
        
        return {
            winner: this.#users[winnerIndex].id,
            loser: this.#users[loserIndex].id
        };
    }

    #generateRandomOrderedTimestamps(numberOfRecords) {
        const now = Math.floor(Date.now() / 1000);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 6);
        weekAgo.setHours(0, 0, 0, 0);
        const weekAgoSeconds = Math.floor(weekAgo.getTime() / 1000)
        const result = [];

        for (let i = 0; i < numberOfRecords; i++) {
            const randomTimestamp = Math.floor(Math.random() * (now - weekAgoSeconds)) + weekAgoSeconds;
            result.push(randomTimestamp);
        }

        result.sort((a, b) => a - b);
        return result;
    }

    #generateGameRecords(numberOfRecords) {
        const recordsDates = this.#generateRandomOrderedTimestamps(numberOfRecords);

        recordsDates.forEach(date => {
            const { winner, loser } = this.#selectRandomPlayers();
            const matchData = this.#createMatchData(winner, loser, date);
            this.#database.addGameRecord(matchData);
        });
    }

    #createMatchData(winnerId, loserId, date) {
        return {
            win_id: winnerId,
            win_name: faker.person.firstName(),
            lose_id: loserId,
            lose_name: faker.person.firstName(),
            game_type: this.#gameTypes[Math.floor(Math.random() * this.#gameTypes.length)],
            date: date
        };
    }

    generate(numberOfUsers, numberOfRecords) {

        this.#generateUsers(numberOfUsers);
        this.#generateGameRecords(numberOfRecords);
        return numberOfRecords;
    }
}

export default RecordGenerator;