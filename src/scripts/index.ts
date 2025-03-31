import View from './view';

// Local Storage Keys
const LOCAL_USERS_KEY = 'LOCAL_USERS_KEY';
const DELETED_USERS_KEY = 'DELETED_USERS_KEY';

// Initialize the view to start fetching and rendering the data.
const viewConfig = {
    usersListId: 'users-list',
    addUserFormId: 'add-user-form',
    sortBtnId: 'sort-btn',
    sortFieldSelectId: 'sort-field',
    sortOrderSelectId: 'sort-order',
};

new View(LOCAL_USERS_KEY, DELETED_USERS_KEY, viewConfig);
