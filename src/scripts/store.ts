import User, { isValidUser } from './user.ts';

const USERS_URL = 'https://dummyjson.com/users';

export default class Store {
    #users: Array<User>;
    #localUsersKey: string;
    #deletedUsersKey: string;
    #deletedUsers: number[];

    #renderUsers: (users: Array<User>) => void;

    constructor(
        localUsersKey: string,
        deletedUsersKey: string,
        renderUsers: (users: Array<User>) => void
    ) {
        this.#localUsersKey = localUsersKey;
        this.#deletedUsersKey = deletedUsersKey;
        this.#renderUsers = renderUsers;

        this.#deletedUsers = this.getDeletedUsers();
        this.#users = this.getLocalUsers();

        this.#renderUsers(this.#users);

        this.fetchUsers().then((users) => {
            this.#users.push(...users);
            this.#renderUsers(this.#users);
        });
    }

    getDeletedUsers(): number[] {
        let storedDeletedUsers: unknown;
        try {
            const storedDeletedUsersStr = localStorage.getItem(
                this.#deletedUsersKey
            );
            if (storedDeletedUsersStr) {
                storedDeletedUsers = JSON.parse(storedDeletedUsersStr);
            }
        } catch (err) {
            console.log(err);
        }

        const deletedUsers: number[] = [];
        if (Array.isArray(storedDeletedUsers)) {
            storedDeletedUsers.forEach((id: unknown) => {
                if (typeof id === 'number') {
                    deletedUsers.push(id);
                }
            });
        }

        return deletedUsers;
    }

    // Extract valid user from unknown Array.
    extractValidUser(usersUnknown: unknown): Array<User> {
        const users: Array<User> = [];
        if (Array.isArray(usersUnknown)) {
            usersUnknown.forEach((user: unknown) => {
                if (isValidUser(user)) {
                    if (
                        typeof user.id === 'string' ||
                        (typeof user.id === 'number' &&
                            !this.#deletedUsers.includes(user.id))
                    ) {
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
                }
            });
        }

        return users;
    }

    // Fetch locally stored users.
    getLocalUsers(): Array<User> {
        try {
            const localUsersStr = localStorage.getItem(this.#localUsersKey);
            const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
            return this.extractValidUser(localUsers);
        } catch (err) {
            console.error('Error parsing local users:', err);
            return [];
        }
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

    addUser(user: Omit<User, 'id'>) {
        this.#users.unshift(
            new User(
                crypto.randomUUID(),
                user.firstName,
                user.lastName,
                user.age,
                user.email,
                user.phone,
                user.gender
            )
        );

        this.#renderUsers(this.#users);

        this.saveLocalUsers();
    }

    deleteUser(id: string | number) {
        this.#users = this.#users.filter((user) => user.id !== id);

        this.#renderUsers(this.#users);

        if (typeof id === 'string') {
            this.saveLocalUsers();
        } else {
            if (!this.#deletedUsers.includes(id)) {
                this.#deletedUsers.push(id);
                localStorage.setItem(
                    this.#deletedUsersKey,
                    JSON.stringify(this.#deletedUsers)
                );
            }
        }
    }

    updateUser(newUser: User) {
        this.#users = this.#users.map((user) => {
            return user.id === newUser.id ? newUser : user;
        });

        this.#renderUsers(this.#users);

        if (typeof newUser.id === 'string') {
            this.saveLocalUsers();
        }
    }

    sort(attribute: 'firstName' | 'lastName' | 'age', order: 'asc' | 'desc') {
        this.#users.sort((a, b) => {
            let result = 0;
            if (attribute === 'age') {
                result = a[attribute] - b[attribute];
            } else {
                result = a[attribute].localeCompare(b[attribute]);
            }

            if (order === 'desc') return -1 * result;
            return result;
        });

        this.#renderUsers(this.#users);
    }
}
