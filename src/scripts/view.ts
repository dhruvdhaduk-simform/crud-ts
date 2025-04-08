import User from './user.ts';
import Store from './store.ts';

export default class View {
    #store: Store;
    #usersList: HTMLTableSectionElement;
    #userForm: HTMLFormElement;
    #sortBtn: HTMLButtonElement;
    #sortFieldSelect: HTMLSelectElement;
    #sortOrderSelect: HTMLSelectElement;
    #editUser: User | null;

    constructor(
        localUsersKey: string,
        deletedUsersKey: string,
        elementIds: {
            usersListId: string;
            userFormId: string;
            sortBtnId: string;
            sortFieldSelectId: string;
            sortOrderSelectId: string;
            addUserBtnId: string;
        }
    ) {
        this.#editUser = null;

        // Select the body of users table.
        const usersList = document.querySelector(`#${elementIds.usersListId}`);
        if (!(usersList instanceof HTMLTableSectionElement)) {
            const msg = "Couldn't find the Users Table on this page.";
            alert(msg);
            throw new ReferenceError(msg);
        }
        this.#usersList = usersList;

        // Select the form element for User Form.
        const userForm = document.querySelector(`#${elementIds.userFormId}`);
        if (!(userForm instanceof HTMLFormElement)) {
            const msg = "Couldn't find the User Form on this page.";
            alert(msg);
            throw new ReferenceError(msg);
        }
        this.#userForm = userForm;

        this.#userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUserFormSubmit();
        });

        const addUserBtn = document.querySelector(
            `#${elementIds.addUserBtnId}`
        );
        if (!(addUserBtn instanceof HTMLButtonElement)) {
            const msg = "Couldn't find the Add User Button on this page.";
            alert(msg);
            throw new ReferenceError(msg);
        }

        addUserBtn.addEventListener('click', () => {
            if (this.#editUser) {
                this.setUserFormHeading('Add User');
                this.#userForm.reset();
                this.#editUser = null;
            }
        });

        // Select sort button.
        const sortBtn = document.querySelector(`#${elementIds.sortBtnId}`);
        if (!(sortBtn instanceof HTMLButtonElement)) {
            const msg = "Couldn't find Sort button on this page.";
            alert(msg);
            throw new ReferenceError(msg);
        }
        this.#sortBtn = sortBtn;

        // Select sort options selectors.
        const sortFieldSelect = document.querySelector(
            `#${elementIds.sortFieldSelectId}`
        );
        const sortOrderSelect = document.querySelector(
            `#${elementIds.sortOrderSelectId}`
        );
        if (
            !(sortFieldSelect instanceof HTMLSelectElement) ||
            !(sortOrderSelect instanceof HTMLSelectElement)
        ) {
            const msg = "Couldn't find the Sort Options Selector on this page.";
            throw new ReferenceError(msg);
        }
        this.#sortFieldSelect = sortFieldSelect;
        this.#sortOrderSelect = sortOrderSelect;

        // Attach event listener to sort button.
        this.#sortBtn.addEventListener('click', () => {
            this.sort();
        });

        // Initialize the User Store.
        this.#store = new Store(
            localUsersKey,
            deletedUsersKey,
            this.renderUsers.bind(this)
        );

        this.attachFormValidationHandlers();
    }

    attachFormValidationHandlers() {
        const firstNameInput = this.#userForm['first-name'];
        const lastNameInput = this.#userForm['last-name'];
        if (
            firstNameInput instanceof HTMLInputElement &&
            lastNameInput instanceof HTMLInputElement
        ) {
            [firstNameInput, lastNameInput].forEach((input) => {
                input.addEventListener('input', () => {
                    input.value =
                        input.value.match(/[a-zA-Z\d]/g)?.join('') || '';
                });
            });
        }

        const phoneInput = this.#userForm['phone'];
        if (phoneInput instanceof HTMLInputElement) {
            phoneInput.addEventListener('input', () => {
                phoneInput.value =
                    phoneInput.value.match(/[\d\s+()-]/g)?.join('') || '';

                phoneInput.value = phoneInput.value.replace(/\s+/g, ' ');
            });
        }

        const ageInput = this.#userForm['age'];
        if (ageInput instanceof HTMLInputElement) {
            ageInput.addEventListener('input', () => {
                ageInput.value =
                    ageInput.value.match(/\d{0,2}/)?.join('') || '';
            });
        }
    }

    // Handle Add/Update User form submit.
    handleUserFormSubmit() {
        // Extract the form data.
        const firstNameInput = this.#userForm['first-name'].value;
        const lastNameInput = this.#userForm['last-name'].value;
        const ageInput = this.#userForm['age'].value;
        const emailInput = this.#userForm['email'].value;
        const phoneInput = this.#userForm['phone'].value;
        const genderInput = this.#userForm['gender'].value;

        // Validate the form data.
        if (typeof firstNameInput !== 'string') {
            alert('Invalid First Name');
            return;
        }
        if (typeof lastNameInput !== 'string') {
            alert('Invlid Last Name');
            return;
        }
        if (!isFinite(Number(ageInput))) {
            alert('Invalid Age');
            return;
        }
        if (typeof emailInput !== 'string') {
            alert('Invalid Email');
            return;
        }
        if (typeof phoneInput !== 'string') {
            alert('Invalid Phone Number');
            return;
        }
        if (genderInput !== 'male' && genderInput !== 'female') {
            alert('Invalid Gender');
            return;
        }

        // Store the form data with correct type.
        const firstName: string = firstNameInput.trim();
        const lastName: string = lastNameInput.trim();
        const age: number = Number(ageInput);
        const email: string = emailInput.trim();
        const phone: string = phoneInput.trim();
        const gender: 'male' | 'female' = genderInput;

        if ([firstName, lastName, email, phone].includes('')) {
            alert('All input fields are required.');
            return;
        }
        if (age < 0) {
            alert('Age cannot be negative');
            return;
        }

        if (!this.#editUser) {
            this.#store.addUser({
                firstName,
                lastName,
                age,
                email,
                phone,
                gender,
            });
        } else {
            this.#store.updateUser({
                id: this.#editUser.id,
                firstName,
                lastName,
                age,
                email,
                phone,
                gender,
            });
            this.#editUser = null;
            this.setUserFormHeading('Add User');
        }

        this.#userForm.reset();

        // Close the Form Popup.
        const popup = this.#userForm.closest('div[popover]');
        if (popup instanceof HTMLDivElement) {
            popup.hidePopover();
        }
    }

    createElements(tagName: string, count: number): Array<HTMLElement> {
        const elements: Array<HTMLElement> = [];

        for (let i = 0; i < count; i++) {
            elements.push(document.createElement(tagName));
        }

        return elements;
    }

    createUserRow(user: User) {
        // Create a new raw for user with its child elements.
        const userRow = document.createElement('tr');

        const [
            firstNameCell,
            lastNameCell,
            ageCell,
            emailCell,
            phoneCell,
            genderCell,
            editCell,
            deleteCell,
        ] = this.createElements('td', 8) as Array<HTMLTableCellElement>;

        const [editBtn, deleteBtn] = this.createElements(
            'button',
            2
        ) as Array<HTMLButtonElement>;

        // Fill the row with user's data.
        firstNameCell.textContent = user.firstName;
        lastNameCell.textContent = user.lastName;
        ageCell.textContent = `${user.age}`;
        emailCell.textContent = user.email;
        phoneCell.textContent = user.phone;
        genderCell.textContent = user.gender;

        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.value = 'edit';
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');

        userRow.dataset.id = `${user.id}`;

        // Append the child element to row.
        editCell.append(editBtn);
        deleteCell.append(deleteBtn);
        userRow.append(
            ...[
                firstNameCell,
                lastNameCell,
                ageCell,
                emailCell,
                phoneCell,
                genderCell,
                editCell,
                deleteCell,
            ]
        );

        deleteBtn.addEventListener('click', () => {
            if (
                window.confirm(
                    `Are you sure you want to delete ${user.firstName}`
                )
            ) {
                this.#store.deleteUser(user.id);
            }
        });

        editBtn.addEventListener('click', () => {
            this.#userForm['first-name'].value = user.firstName;
            this.#userForm['last-name'].value = user.lastName;
            this.#userForm['age'].value = user.age;
            this.#userForm['email'].value = user.email;
            this.#userForm['phone'].value = user.phone;
            this.#userForm['gender'].value = user.gender;

            this.#editUser = user;

            this.setUserFormHeading('Update User');

            const popup = this.#userForm.closest('div[popover]');
            if (popup instanceof HTMLDivElement) {
                popup.showPopover();
            }
        });

        return userRow;
    }

    // Render users in table from User[] array.
    renderUsers(users: Array<User>, noCacheUserId?: string | number) {
        if (!users.length) return;

        // Array to hold rows corresponding to each User.
        const rowsToRender: HTMLTableRowElement[] = [];
        const rowsRendered: NodeListOf<HTMLTableRowElement> =
            document.querySelectorAll('tr[data-id]');
        const existingRows = new Map<string, HTMLTableRowElement>();

        rowsRendered.forEach((row) => {
            if (row.dataset.id) existingRows.set(row.dataset.id, row);
        });

        users.forEach((user) => {
            if (noCacheUserId !== user.id) {
                // Check if there is already a Row for user.
                const cachedRow = existingRows.get(`${user.id}`);
                if (cachedRow) {
                    rowsToRender.push(cachedRow);
                    return;
                }
            }

            // Create a new raw for user with its child elements.
            const userRow = this.createUserRow(user);

            // Push the rows in array.
            rowsToRender.push(userRow);
        });

        // Clear the previously rendered users.
        this.#usersList.innerHTML = '';
        // Add users to table from array.
        this.#usersList.append(...rowsToRender);
    }

    // Handle the sorting.
    sort() {
        const field: string = this.#sortFieldSelect.value;
        const order: string = this.#sortOrderSelect.value;

        if (field !== 'firstName' && field !== 'lastName' && field !== 'age') {
            alert('Invalid Sorting field.');
            return;
        }

        if (order !== 'asc' && order !== 'desc') {
            alert('Invalid Sorting order.');
            return;
        }

        this.#store.sort(field, order);
    }

    isValidEmail(email: string): boolean {
        const input = document.createElement('input');
        input.type = 'email';
        input.value = email;
        return input.checkValidity();
    }

    setUserFormHeading(heading: string) {
        const userFormHeading = document.querySelector('#user-form-heading');
        if (userFormHeading) {
            userFormHeading.textContent = heading;
        }
    }
}
