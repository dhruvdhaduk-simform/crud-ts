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

