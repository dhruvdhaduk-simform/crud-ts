import User, { isValidUser } from './user.ts';

const USERS_URL = 'https://dummyjson.com/users';

export default class Store {
    #users: Array<User>;
    #localUsersKey: string;
    #renderUsers: (users: Array<User>) => void;

    constructor(
        localUsersKey: string,
        renderUsers: (users: Array<User>) => void
    ) {
        this.#localUsersKey = localUsersKey;
        this.#renderUsers = renderUsers;

        this.#users = this.getLocalUsers();
        this.#renderUsers(this.#users);

        this.fetchUsers().then((users) => {
            this.#users.push(...users);
            this.#renderUsers(this.#users);
        });
    }

    // Extract valid user from unknown Array.
    extractValidUser(usersUnknown: unknown): Array<User> {
        const users: Array<User> = [];
        if (Array.isArray(usersUnknown)) {
            usersUnknown.forEach((user: unknown) => {
                if (isValidUser(user)) {
                    users.push(
                        new User(
                            user.id,
                            user.firstName,
                            user.lastName,
                            user.age,
                            user.email,
                            user.phone,
                            user.gender
                        )
                    );
                }
            });
        }

        return users;

    }

    // Fetch locally stored users.
    getLocalUsers(): Array<User> {
        let localUsers: unknown;
        try {
            const localUsersStr = localStorage.getItem(this.#localUsersKey);
            if (localUsersStr) {
                localUsers = JSON.parse(localUsersStr);
            }
        } catch (err) {
            console.log(err);
        }

        return this.extractValidUser(localUsers);
    }

    // Fetch users from API.
    async fetchUsers(): Promise<Array<User>> {
        const response = await fetch(USERS_URL);
        const data: { users: unknown } = await response.json();

        return this.extractValidUser(data?.users);
    }

    // Update localStorage to store all local users.
    saveLocalUsers() {
        localStorage.setItem(
            this.#localUsersKey,
            JSON.stringify(
                this.#users.filter((user) => typeof user.id === 'string')
            )
        );
    }
}
