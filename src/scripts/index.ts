import View from './view';

// Local Storage Keys
const LOCAL_USERS_KEY = 'LOCAL_USERS_KEY';

// Initialize the view to start fetching and rendering the data.
const viewConfig = {
    usersListId: 'users-list',
    addUserFormId: 'add-user-form',
};

new View(LOCAL_USERS_KEY, viewConfig);
