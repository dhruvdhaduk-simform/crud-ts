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

    // Render users in table from User[] array.
    renderUsers(users: User[]) {
        // Array to hold rows corresponding to each User.
        const userRows: HTMLTableRowElement[] = [];

        users.forEach((user) => {
            // Check if there is already a Row for user.
            const userRowExisting = document.querySelector(
                `tr[data-id="${user.id}"]`
            );
            if (userRowExisting instanceof HTMLTableRowElement) {
                userRows.push(userRowExisting);
                return;
            }

            // Create a new raw for user with its child elements.
            const userRow = document.createElement('tr');

            const firstNameTD = document.createElement('td');
            const lastNameTD = document.createElement('td');
            const ageTD = document.createElement('td');
            const emailTD = document.createElement('td');
            const phoneTD = document.createElement('td');
            const genderTD = document.createElement('td');
            const editTD = document.createElement('td');
            const deleteTD = document.createElement('td');

            const editBtn = document.createElement('button');
            const deleteBtn = document.createElement('button');

            // Fill the row with user's data.
            firstNameTD.textContent = user.firstName;
            lastNameTD.textContent = user.lastName;
            ageTD.textContent = `${user.age}`;
            emailTD.textContent = user.email;
            phoneTD.textContent = user.phone;
            genderTD.textContent = user.gender;

            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');

            userRow.dataset.id = `${user.id}`;

            // Append the child element to row.
            editTD.append(editBtn);
            deleteTD.append(deleteBtn);
            userRow.append(
                ...[
                    firstNameTD,
                    lastNameTD,
                    ageTD,
                    emailTD,
                    phoneTD,
                    genderTD,
                    editTD,
                    deleteTD,
                ]
            );

            // Push the rows in array.
            userRows.push(userRow);
        });

        // Clear the previously rendered users.
        this.#usersList.innerHTML = '';
        // Add users to table from array.
        this.#usersList.append(...userRows);
    }
}
