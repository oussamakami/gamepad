# Transcendence
This is a full-stack web development project focused on building a single-page application (SPA) with user authentication, multiplayer gaming, real-time statistics, and game history tracking.
# Features
* **Secure user authentication**
* **Comprehensive user management**
* **Real-time live chat**
* **Online multiplayer gaming**
* **Live performance statistics**
* **Game history tracking**
* **Tournament creation and participation**
* **Dynamic leaderboards**

# Implemented Technologies
* **HTML/HTML5**
* **CSS/CSS3**
* **Typescript**
* **NodeJs**
* **Fastify**
* **SQLite3**
* **Docker**

# Modules
## Design
- [X] **Navigation**
    - [X] **Top Navigation**
        - [X] Profile Name
        - [X] Profile Picture
        - [X] Fullscreen Toggle
        - [X] Light/Dark Mode Toggle
        - [X] Settings Shortcut
        - [X] Notifications Drawer
        - [X] User Search Bar
        - [X] Sidebar Toggle
    - [X] **Side Navigation**
        - [X] App Logo
        - [X] Dashboard Navigation
        - [X] Games Navigation
        - [X] Logout Button
- [X] **Dashboard**
    - [X] Total games played count
    - [X] Total Ping Pong games played
    - [X] Total Tic-Tac-Toe games played
    - [X] Total Rock-Paper-Scissors games played
    - [X] Graph displaying total games played per day over the last 7 days
    - [X] History of the last games played
    - [X] Leaderboard showcasing the top 10 players
    - [X] Refresh Button for updating dashboard statistics
- [ ] **Live Chat**
    - [ ] Display list of active chats
    - [ ] Interactive chat box
    - [ ] Start **Ping Pong** game button
    - [ ] Start **Tic-Tac-Toe** game button
    - [ ] Start **Rock-Paper-Scissors** game button
    - [ ] Delete conversation option
    - [ ] Show basic user report
    - [ ] Option to block a user
- [X] **Friends List**
    - [X] Display user profile picture
    - [X] Show user name
    - [X] Show user gender
    - [X] Profile button
    - [X] Unfollow button
    - [X] Block user button
- [X] **Search Results**
    - [X] Show total number of results found
    - [X] Display user profile picture
    - [X] Show user name
    - [X] Show user gender
    - [X] Profile button
    - [X] Follow/Unfollow button
    - [X] Block user button
- [X] **Profile**
    - [X] Display user picture
    - [X] Show user name
    - [X] Show user ID
    - [X] Show user email
    - [X] Show user gender
    - [X] Display total games played
    - [X] Display total games won
    - [X] Display total games lost
    - [X] Show total **Ping Pong** games played
    - [X] Show total **Tic-Tac-Toe** games played
    - [X] Show total **Rock-Paper-Scissors** games played
    - [X] Display history of the last 20 games played
    - [X] Follow/Unfollow option
    - [X] Option to send a message
    - [X] Option to block the user
    - [X] Indicate if the user is online
- [ ] **Settings**
    - [ ] Update profile picture
    - [ ] Edit user name
    - [ ] Change email address
    - [ ] Reset or change password
    - [ ] **Logged-in Sessions**
        - [ ] Display session name
        - [ ] Sign out button for each session
        - [ ] Sign out from all sessions button
    - [ ] **Privacy Settings**
        - [ ] Choose who can view your profile
        - [ ] Choose who can see your game history
    - [ ] **Two-Factor Authentication (2FA)**
        - [ ] Enable or disable 2FA
        - [ ] Receive 2FA codes via email
        - [ ] Use an authentication app for 2FA
    - [ ] **Blocked Users**
        - [ ] View blocked users list
        - [ ] Unblock a user
    - [ ] **Account & Data Management**
        - [ ] Clear game history
        - [ ] Permanently delete account
- [ ] **Games**
    - [ ] **Ping Pong**
        - [ ] Set user nickname
        - [ ] Generate a unique game ID
        - [ ] Generate a tournament game ID
        - [ ] Enter game/tournament ID to join
        - [ ] Join a random game button
    - [ ] **Tic-Tac-Toe**
        - [ ] Set user nickname
        - [ ] Generate a unique game ID
        - [ ] Generate a tournament game ID
        - [ ] Enter game/tournament ID to join
        - [ ] Join a random game button
    - [ ] **Rock-Paper-Scissors**
        - [ ] Set user nickname
        - [ ] Generate a unique game ID
        - [ ] Generate a tournament game ID
        - [ ] Enter game/tournament ID to join
        - [ ] Join a random game button
- [X] **Authentication**
    - [X] **Login**
        - [X] Email input field
        - [X] Password input field
        - [X] "Remember Me" checkbox
        - [X] Password recovery link
        - [X] Submit button to log in
        - [X] Option to sign in with Google
        - [X] "Sign Up" button for new users
    - [X] **Sign Up**
        - [X] Full name input field
        - [X] Email input field
        - [X] Password input field
        - [X] Agree to terms & conditions checkbox
        - [X] Submit button to register
        - [X] Option to sign up with Google
    - [X] **Two-Factor Authentication (2FA)**
        - [X] Input field to enter authentication code
        - [X] "Verify" button to confirm identity
        - [X] Option to resend authentication code
    - [X] **Account Recovery**
        - [X] Input field for registered email
        - [X] "Recover Account" button
    - [X] **Password Reset**
        - [X] New password input field
        - [X] Confirm new password input field
        - [X] "Reset Password" button
- [X] **404 Error Page**
    - [X] Display "Page Not Found" message
    - [X] Show a friendly error description
    - [X] Include a home button to navigate back
- [ ] **Responsive Design**
    - [ ] Support multiple screen sizes:
        - [ ] Mobile (≤ 480px)
        - [ ] Small Tablets (481px – 768px)
        - [ ] Large Tablets (769px – 1024px)
        - [ ] Laptops (1025px – 1366px)
        - [X] Desktops (1367px – 1920px)
        - [X] Ultra-Wide Screens (≥ 1921px)
    - [ ] Check cross-browser compatibility for Chrome and Firefox

## Front-End Code
- [ ] **Forms Module Implementation**
    - [X] **Core Form Handling**
        - [X] Specify `formId` to uniquely identify the form.
        - [X] Define the HTTP request method (`GET`, `POST`, etc.).
        - [X] Set the target API endpoint for data submission.
    - [X] **Optional Callbacks**
        - [X] Execute a function after a successful form submission (`onSuccess`).
    - [ ] **Forms to handle**
        - [X] **Login Form**
        - [X] **Signup Form**
        - [ ] **Account Recovery Form**
        - [ ] **Password Reset Form**
        - [ ] **Two-Factor Authentication (2FA) Form**
        - [ ] **User Settings Form**
- [X] **User Data Module Implementation**
    - [X] **Core User Handling**
        - [X] Process the API response object to manage user data.
    - [X] **Module Methods**
        - [X] Retrieve the user ID.
        - [X] Retrieve the user name.
        - [X] Retrieve the user theme preference.
        - [X] Retrieve the user email.
        - [X] Update the user theme (store in localStorage).
        - [X] Determine if the user is logged in to show appropriate sections
        - [X] Fetch userData using the session Token
- [X] **SPA Navigation Module Implementation**
    - [X] **Core User Handling**
        - [X] Reference to the `userdata` object
    - [X] **Module Methods**
        - [X] **Section & Path Mapping**
            - [X] Map URL paths to website **auth sections**
            - [X] Map URL paths to website **dashboard sections**
            - [X] Enable support for custom on-load functions in mapped sections
            - [X] Set the **error page section ID**
            - [X] Set the **primary navigation bar ID**
            - [X] Set the **secondary navigation bar ID**
        - [X] **Section Visibility & Error Handling**
            - [X] Show a **section** based on the URL path
                - [X] Execute the custom on-load function (if specified) before displaying the section
                - [X] Display the error page if the on-load function fails
                - [X] Clear loginStatus and redirect to / if the on-load function returns a 401 error response
            - [X] Hide **all sections** (both auth and dashboard sections)
            - [X] Show the **error page section** dynamically with an error code and message
            - [X] Hide the **error page section**
            - [X] Show the **navigation bar**
            - [X] Hide the **navigation bar**
        - [X] **Browser History & Redirection**
            - [X] Add a **URL path** to the browser history (`pushToHistory`)
            - [X] Redirect the user to another **URL path** (`navigateTp`)
        - [X] **Event Handling for SPA Navigation**
            - [X] Handle events for **anchor (`<a>`) links**
            - [X] Initialize event listening on all **anchor links** for smooth SPA navigation
- [X] **Charts Module Implementation**
    - [X] **Core User Handling**
        - [X] Specify the `elementId` of the DOM element that will contain the chart
    - [X] **Module Methods**
        - [X] **Chart Configuration – Getters**
            - [X] Get the chart `theme`
            - [X] Get the chart `text color`
            - [X] Get the chart `bars color`
            - [X] Get the chart `categories`
            - [X] Get the chart `dataset`
        - [X] **Chart Configuration – Setters**
            - [X] Set the chart `theme`
            - [X] Set the chart `text color`
            - [X] Set the chart `bars color`
            - [X] Set the chart `categories`
            - [X] Set the chart `dataset`
        - [X] **Chart Rendering & Lifecycle**
            - [X] Render or update the chart in the DOM
            - [X] Destroy the chart instance
        - [X] Support CSS variables as valid color inputs
- [ ] **Buttons Action Module Implementation**
    - [ ] *To be added soon*

### Games
*To be added soon*

## Back-End Code
### Database
- [X] **User Data**
    - [X] **Table Structure**
        - [X] `id` → INTEGER, PRIMARY KEY
        - [X] `username` → TEXT, UNIQUE
        - [X] `email` → TEXT, UNIQUE
        - [X] `password` → TEXT
        - [X] `_2fa` → BOOLEAN
        - [X] `_2fa_method` → TEXT (`email`, `app`)
        - [X] `profile_visibility` → TEXT (`public`, `friends_only`, `private`)
        - [X] `history_visibility` → TEXT (`public`, `friends_only`, `private`)
    - [X] **Methods**
        - [X] Create a new user
        - [X] Retrieve a user
        - [X] Retrieve all users
        - [X] Update user details
        - [X] Delete a user
- [X] **Session Data**
    - [X] **Table Structure**
        - [X] `token_id` → TEXT, PRIMARY KEY
        - [X] `user_id` → INTEGER, FOREIGN KEY (references `Users.id`)
        - [X] `ip_address` → TEXT
        - [X] `browser` → TEXT
        - [X] `platform` → TEXT
        - [X] `expiration_date` → INTEGER (timestamp)
    - [X] **Methods**
        - [X] Create a new session
        - [X] Delete a session
        - [X] Delete all sessions for a user
        - [X] Retrieve a session by ID
        - [X] Retrieve all sessions for a user
        - [X] Validate a session
- [ ] **Friend Requests Data** (@oussamakami)
    - [ ] **Table Structure**
        - [ ] `sender_id` → INTEGER, FOREIGN KEY (references `Users.id`)
        - [ ] `recipient_id` → INTEGER, FOREIGN KEY (references `Users.id`)
        - [ ] `status` → TEXT (`pending`, `accepted`, `blocked`)
    - [ ] **Methods**
        - [ ] Send a friend request
        - [ ] Accept a friend request
        - [ ] Reject a friend request (removes the row)
        - [ ] Retrieve a user's friends list
        - [ ] Retrieve all pending friend requests for a user
        - [ ] Block a user
        - [ ] Unblock a user (removes the row, same as rejection)
        - [ ] Search for users (fetch from `Users` table, excluding blocked users)
- [X] **Game History Data**
    - [X] **Table Structure**
        - [X] `winner_id` → INTEGER, FOREIGN KEY (references `Users.id`)
        - [X] `winner_nickname` → TEXT
        - [X] `loser_id` → INTEGER, FOREIGN KEY (references `Users.id`)
        - [X] `loser_nickname` → TEXT
        - [X] `game_type` → TEXT (`ping-pong`, `rock-paper`, `tic-tac-toe`)
        - [X] `date` → INTEGER (timestamp)
    - [X] **Methods**
        - [X] Create a new game record
        - [X] Fetch game records for the website stats (`page_number`)
        - [X] Fetch game records for a specific user (`user_id`, `page_number`)
        - [X] Fetch website leaderBoard
        - [X] Fetch website total records count
        - [X] Fetch website total records count for one day
        - [X] Fetch website records count for the last 7 days
        - [X] Fetch website dashboard statistics
        - [X] Fetch user total wins count (`user_id`)
        - [X] Fetch user total loses count (`user_id`)
        - [X] Fetch user Profile statistics (`user_id`)
- [X] **Chat Data**
    - [X] **Table Structure**
        - [X] `id` → INTEGER, PRIMARY KEY
        - [X] `user1_id` → INTEGER, FOREIGN KEY (references `Users.id`)
        - [X] `user2_id` → INTEGER, FOREIGN KEY (references `Users.id`)
    - [X] **Methods**
        - [X] Create a new chat
        - [X] Fetch all chats for a specific user
        - [X] Fetch chat by Participants
        - [X] Fetch chat by chat ID
        - [X] Fetch all chats
        - [X] Delete chat by chat ID
        - [X] Delete user from a chat
- [X] **Messages Data**
    - [X] **Table Structure**
        - [X] `chat_id` → INTEGER, FOREIGN KEY (references `Chat.id`)
        - [X] `sender_id` → INTEGER, FOREIGN KEY (references `Users.id`)
        - [X] `content` → BLOB (message content)
        - [X] `date` → INTEGER (timestamp)
    - [X] **Methods**
        - [X] Send a message (`chat_id`, `sender_id`, `content`)
        - [X] Fetch messages for a chat (`chat_id`, `page_number`) – (20 messages per page)

### API URLS
- [X] signup **POST**
    - [X] Takes user data (`username`, `email`, `password`)  
    - [X] Validates all fields are present  
    - [X] Checks if username/email already exists  
    - [X] Creates new user if validation passes  
    - [X] Returns appropriate success/error response  
- [ ] login **POST**  
    - [X] Takes user credentials (`username`/`email` and `password`)  
    - [X] Verifies credentials match existing user  
    - [ ] Sets up HTTP-only session cookie if valid  
    - [X] Returns appropriate success/error response  
- [X] sessionData **GET**  
    - [X] Checks for valid session cookie  
    - [X] Returns current user's basic info if valid  
    - [X] Returns error if session invalid/expired  
- [ ] picture/`:userId` **GET**  
    - [X] Takes target user ID in URL  
    - [X] Verifies requesting user has valid session  
    - [ ] Checks if requesting user is blocked by target  
    - [X] Returns profile picture if authorized  
    - [X] Returns appropriate error if not found/blocked  
- [X] stats **GET**  
    - [X] Requires valid session  
    - [X] Returns global website statistics  
    - [X] Includes total games, game-type breakdowns  
    - [X] Shows weekly trends and today's activity  
    - [X] Returns recent match history  
- [ ] users/`:userId` **GET**  
    - [X] Takes target user ID in URL  
    - [X] Verifies requesting user has valid session  
    - [ ] Checks if requesting user is blocked  
    - [X] Returns target user's game statistics if authorized  
    - [X] Shows win/loss records per game type  
    - [X] Includes recent match history with opponents  
    - [X] Returns appropriate error if not found/blocked
        
### Security
- [ ] Pretect against **Cross-Site Scripting (XSS)**
- [X] Pretect against **SQL Injection**
- [ ] Implement a custom hashing algorithm
- [ ] Implement/Enforce **HTTPS** communication

# Authors

- Oussama Kamili [@oussamakami](https://github.com/oussamakami)

- Salah Eddine Lazar [@slazar42](https://github.com/slazar42)

- Abdellah amardoul [@loudrama](https://github.com/loudrama)

- Anas Kheireddine [@kheireddine-anas](https://github.com/kheireddine-anas)

# License
This Project Is Licensed Under &copy; [**MIT**](./LICENSE)
