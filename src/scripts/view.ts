import User from './user.ts';
import Store from './store.ts';

export default class View {
    // Ignoring eslint error of unused variable. (Will be used in future.)
    // eslint-disable-next-line
    #store: Store;
    #usersList: HTMLTableSectionElement;

    constructor(
        localUsersKey: string,
        elementIds: {
            usersListId: string;
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

        // Initialize the User Store.
        this.#store = new Store(localUsersKey, this.renderUsers.bind(this));
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
