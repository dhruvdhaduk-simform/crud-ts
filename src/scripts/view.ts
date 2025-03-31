import User from './user.ts';
import Store from './store.ts';

export default class View {
    #store: Store;
    #usersList: HTMLTableSectionElement;
    #addUserForm: HTMLFormElement;

    constructor(
        localUsersKey: string,
        deletedUsersKey: string,
        elementIds: {
            usersListId: string;
            addUserFormId: string;
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
        const firstName: string = firstNameInput;
        const lastName: string = lastNameInput;
        const age: number = Number(ageInput);
        const email: string = emailInput;
        const phone: string = phoneInput;
        const gender: 'male' | 'female' = genderInput;

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

        return userRow;
    }

    // Render users in table from User[] array.
    renderUsers(users: Array<User>) {
        // Array to hold rows corresponding to each User.
        const rowsToRender: HTMLTableRowElement[] = [];
        const rowsRendered: NodeListOf<HTMLTableRowElement> =
            document.querySelectorAll('tr[data-id]');
        const existingRows = new Map<string, HTMLTableRowElement>();

        rowsRendered.forEach((row) => {
            if (row.dataset.id) existingRows.set(row.dataset.id, row);
        });

        users.forEach((user) => {
            // Check if there is already a Row for user.
            const cachedRow = existingRows.get(`${user.id}`);
            if (cachedRow) {
                rowsToRender.push(cachedRow);
                return;
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
}
