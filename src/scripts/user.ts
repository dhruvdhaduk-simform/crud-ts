/**
 * Represents the User entity.
 */
export default class User {
    constructor(
        public id: string | number,
        public firstName: string,
        public lastName: string,
        public age: number,
        public email: string,
        public phone: string,
        public gender: 'male' | 'female'
    ) {}
}

/**
 *
 * @param {unknown} user - The object to validate.
 * @returns (user is User) - Returns true if the object is a valid User, otherwise false.
 */
export function isValidUser(user: unknown): user is User {
    return (
        typeof user === 'object' &&
        (typeof (user as User).id === 'string' ||
            typeof (user as User).id === 'number') &&
        typeof (user as User).firstName === 'string' &&
        typeof (user as User).lastName === 'string' &&
        typeof (user as User).age === 'number' &&
        typeof (user as User).email === 'string' &&
        typeof (user as User).phone === 'string' &&
        ((user as User).gender === 'male' || (user as User).gender === 'female')
    );
}
