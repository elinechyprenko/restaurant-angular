export class User {
    constructor(
        public email: string,
        public fullname: string,
        public phone: number,
        public birthday: Date | null,
        public password: string | number
    ) { }
}