import User, { isUser } from './user.ts';

const USERS_URL = 'https://dummyjson.com/users';

export default class Store {
    #users: User[];
    #localUsersKey: string;

    constructor(localUsersKey: string) {
        this.#localUsersKey = localUsersKey;
        this.#users = this.parseLocalUsers();

        this.fetchUsers().then((users) => {
            this.#users.push(...users);
        });
    }

    // Fetch locally stored users.
    parseLocalUsers(): User[] {
        let localUsers: unknown;
        try {
            const localUsersStr = localStorage.getItem(this.#localUsersKey);
            if (localUsersStr) {
                localUsers = JSON.parse(localUsersStr);
            }
        } catch (err) {
            console.log(err);
        }

        const users: User[] = [];
        if (Array.isArray(localUsers)) {
            localUsers.forEach((user: unknown) => {
                if (isUser(user)) {
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

    // Fetch users from API.
    async fetchUsers(): Promise<User[]> {
        const response = await fetch(USERS_URL);
        const data: { users: unknown } = await response.json();

        const users: User[] = [];

        if (Array.isArray(data?.users)) {
            data.users.forEach((user: unknown) => {
                if (isUser(user)) {
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
