const NAME_REGEX = /^[A-Za-z\s]+[A-Za-z0-9\s]*$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_NUMBER_REGEX = [
    /^(\+[\d]{1,3}\s?)\d{5}\s?\d{5}$/,
    /^(\+[\d]{1,3}\s)?\d{3}\s\d{3}\s\d{4}$/,
    /^(\+[\d]{1,3}[\s-])?\d{3}-\d{3}-\d{4}$/,
    /^(\+[\d]{1,3}\s)?\(\d{3}\)\s\d{3}\s\d{4}$/,
    /^(\+[\d]{1,3}[\s-])?\(\d{3}\)-\d{3}-\d{4}$/,
];

export class FormValidator {
    static validateName(
        name: string,
        namePart: 'firstName' | 'lastName'
    ): string {
        name = name.trim();
        if (!name) return `Please provide a ${namePart}`;

        if (!NAME_REGEX.test(name)) {
            return `${namePart} contains invalid characters. Only letters, numbers, and spaces are allowed, starting with a letter.`;
        }
        return '';
    }

    static validateAge(age: string | number) {
        const ageNum = Number(age);
        if (isNaN(ageNum)) return 'Age is not a valid number.';

        if (ageNum < 0) return 'Age cannot be negative.';

        if (ageNum > 100) return 'Age cannot be greater than 100';
    }

    static validateEmail(email: string) {
        email = email.trim();
        if (!email) return 'Please provide an email.';

        if (!EMAIL_REGEX.test(email)) {
            return 'Invalid Email.';
        }

        return '';
    }

    static validatePhoneNumber(phoneNumber: string) {
        phoneNumber = phoneNumber.trim();
        if (!phoneNumber) return 'Please provide a phone number.';

        for (const REGEX of PHONE_NUMBER_REGEX) {
            if (REGEX.test(phoneNumber)) return '';
        }

        return 'Invalid Phone Number.';
    }

    static showError(inputId: string, message: string): void {
        const errorElement = document.querySelector(
            `#${inputId}-error`
        ) as HTMLElement;
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    static clearError(inputId: string): void {
        const errorElement = document.querySelector(
            `#${inputId}-error`
        ) as HTMLElement;
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
}
