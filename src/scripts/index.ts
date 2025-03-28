import User from './user';
import View from './view';

// Local Storage Keys
const LOCAL_USERS_KEY = 'LOCAL_USERS_KEY';

// Add a local user inside localStorage for testing purpose. (Temporary)
localStorage.setItem(
    LOCAL_USERS_KEY,
    JSON.stringify([
        new User(
            'localId1',
            'Local',
            'User',
            25,
            'local@user.com',
            '0123456789',
            'male'
        ),
    ])
);

// Initialize the view to start fetching and rendering the data.
new View(LOCAL_USERS_KEY, {
    usersListId: 'users-list',
});
