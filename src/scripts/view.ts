import User from './user.ts';
import Store from './store.ts';

export default class View {
    #store: Store;
    #usersList: HTMLTableSectionElement;
    #addUserForm: HTMLFormElement;
    #sortBtn: HTMLButtonElement;
    #sortFieldSelect: HTMLSelectElement;
    #sortOrderSelect: HTMLSelectElement;

    constructor(
        localUsersKey: string,
        deletedUsersKey: string,
        elementIds: {
            usersListId: string;
            addUserFormId: string;
            sortBtnId: string;
            sortFieldSelectId: string;
            sortOrderSelectId: string;
        }
    ) {
        // Select the body of users table.
        const usersList = document.querySelector(`#${elementIds.usersListId}`);
        if (!(usersList instanceof HTMLTableSectionElement)) {
            const msg = "Couldn't find the Users Table on this page.";
            alert(msg);
            throw new ReferenceError(msg);
        }
        this.#usersList = usersList;

        // Select the form element for Add User.
        const addUserForm = document.querySelector(
            `#${elementIds.addUserFormId}`
        );
        if (!(addUserForm instanceof HTMLFormElement)) {
            const msg = "Couldn't find the Add User Form on this page.";
            alert(msg);
            throw new ReferenceError(msg);
        }
        this.#addUserForm = addUserForm;

        this.#addUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddUserFormSubmit();
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
    }

    // Handle Add User form submit.
    handleAddUserFormSubmit() {
        // Extract the form data.
        const firstNameInput = this.#addUserForm['first-name'].value;
        const lastNameInput = this.#addUserForm['last-name'].value;
        const ageInput = this.#addUserForm['age'].value;
        const emailInput = this.#addUserForm['email'].value;
        const phoneInput = this.#addUserForm['phone'].value;
        const genderInput = this.#addUserForm['gender'].value;

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

        this.#store.addUser({
            firstName,
            lastName,
            age,
            email,
            phone,
            gender,
        });

        this.#addUserForm.reset();

        // Close the Form Popup.
        const popup = this.#addUserForm.closest('div[popover]');
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
            this.#store.deleteUser(user.id);
        });

        const editableItems = [
            firstNameCell,
            lastNameCell,
            ageCell,
            emailCell,
            phoneCell,
            genderCell,
        ];

        editBtn.addEventListener('click', () => {
            if (editBtn.value === 'edit') {
                // Turn on the edit mode.
                editableItems.forEach((item) => {
                    item.contentEditable = 'true';
                });

                editBtn.textContent = 'Save';
                editBtn.value = 'save';
            } else {
                // Extract and validate the new age.
                let newAge: number;
                const newAgeInput = ageCell.textContent;
                if (newAgeInput === null || newAgeInput.trim() === '') {
                    newAge = user.age;
                } else if (isFinite(Number(newAgeInput))) {
                    newAge = Number(newAgeInput);
                } else {
                    newAge = user.age;
                }

                // Extract and validate the new gender.
                let newGender: 'male' | 'female';
                const newGenderInput = genderCell.textContent
                    ?.trim()
                    .toLowerCase();
                if (newGenderInput === 'male') newGender = 'male';
                else if (newGenderInput === 'female') newGender = 'female';
                else newGender = user.gender;

                // Create object of updated user.
                const updatedUser = new User(
                    user.id,
                    firstNameCell.textContent ?? user.firstName,
                    lastNameCell.textContent ?? user.lastName,
                    newAge,
                    emailCell.textContent ?? user.email,
                    phoneCell.textContent ?? user.phone,
                    newGender
                );

                updatedUser.firstName = updatedUser.firstName.trim();
                updatedUser.lastName = updatedUser.lastName.trim();
                updatedUser.email = updatedUser.email.trim();
                updatedUser.phone = updatedUser.phone.trim();

                if (
                    [
                        updatedUser.firstName,
                        updatedUser.lastName,
                        updatedUser.email,
                        updatedUser.phone,
                    ].includes('')
                ) {
                    alert('All fields are required.');
                    return;
                }

                if (updatedUser.age < 0) {
                    alert('Age cannot be negative.');
                    return;
                }

                this.#store.updateUser(updatedUser);

                // Turn off the edit mode.
                editableItems.forEach((item) => {
                    item.contentEditable = 'false';
                });

                editBtn.textContent = 'Edit';
                editBtn.value = 'edit';
            }
        });

        return userRow;
    }

    // Render users in table from User[] array.
    renderUsers(users: Array<User>, noCacheUserId?: string | number) {
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
}
