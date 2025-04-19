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

## Installation

Follow the steps below to set up the project:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/oussamakami/gamepad.git
   cd gamepad
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file:**

   ```bash
   touch .env
   ```

4. **Configure environment variables:**

   The `.env` file should contain the following:

   ```
   PORT=<server_port>
   
   JWT_SECRET=<64_character_long_secure_string>
   
   PICTURES_PATH=<absolute_path_to_profile_pictures_directory>
   ```

   To generate a secure `JWT_SECRET`, you can use this command:

   ```bash
   head /dev/urandom | base64 | head -c 64
   ```

   #### Example `.env` file:

   ```
   PORT=3000

   JWT_SECRET=uxgK8HyrB6sE/0eLkQsgGQxZwOz1Qrdt7giegJRm31aoP4PVPzFNYXMVszsoYbQG

   PICTURES_PATH=/home/linux/gamepad/back-end/figures
   ```

5. **Available NPM Scripts:**

   - `npm run build`  
     Compiles the TypeScript code into JavaScript.

   - `npm run clean`  
     Removes the compiled JavaScript code.

   - `npm run api`  
     Starts the backend server only.

   - `npm start`  
     Builds and runs both frontend and backend. The website will be available at `http://localhost:5500`.


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
- [X] **Live Chat**
    - [X] Display list of active chats
    - [X] Interactive chat box
    - [X] Start **Ping Pong** game button
    - [X] Start **Tic-Tac-Toe** game button
    - [X] Start **Rock-Paper-Scissors** game button
    - [X] Delete conversation option
    - [X] Show basic user report
    - [X] Option to block a user
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
- [ ] **Games** (@slazar42)
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
        - [X] Handle session management with backend API
    - [X] **Module Methods**
        - [X] **Data Retrieval**
            - [X] Retrieve the user ID (`userId`)
            - [X] Retrieve the user name (`userName`)
            - [X] Retrieve the user email (`userEmail`)
        - [X] **Session Management**
            - [X] Fetch user data using session token (`fetchSessionData`)
            - [X] Check authentication status (`isAuthenticated`)
            - [X] Clear user data (`clear`)
        - [X] **UI Integration**
            - [X] Automatically update navigation bar user image
            - [X] Automatically update navigation bar user name
- [X] **SPA Navigation Module Implementation**
    - [X] **Core User Handling**
        - [X] Reference to the `userdata` object
        - [X] Configure navigation elements (mainNav, sideNav, errorPage)
    - [X] **Module Methods**
            - [X] **Section Registration**
                - [X] Add authenticated sections (`addDashSection`)
                - [X] Add unauthenticated sections (`addAuthSection`)
                - [X] Support optional FormHandler integration
                - [X] Support custom on-load functions with HTTP promise
                - [X] Handle URL path standardization (trailing slashes, query params)
            - [X] **Section Visibility**
                - [X] Show/hide all sections (`hideAllSections`)
                - [X] Dynamic section display based on auth state
                - [X] Active nav section highlighting
            - [X] **Error Handling**
                - [X] Custom error page display (`showError`)
        - [X] **Browser History & Redirection**
            - [X] Add a **URL path** to the browser history (`pushToHistory`)
            - [X] Redirect the user to another **URL path** (`navigateTp`)
            - [X] Page reload functionality (`reloadPage`)
        - [X] **Event Handling for SPA Navigation**
            - [X] Handle events for **anchor (`<a>`) links**
            - [X] Initialize event listening on all **anchor links** for smooth SPA navigation
            - [X] Popstate event handling for back/forward
            - [X] DOMContentLoaded initialization
        - [X] **UI Integration**
            - [X] Automatic user image/name updates
            - [X] Form state reset on navigation
- [X] **Charts Module Implementation**
    - [X] **Core Initialization**
        - [X] Specify the `elementId` of the DOM element that will contain the chart
        - [X] Auto-detect system theme from localStorage
        - [X] Throw error for invalid element IDs
    - [X] **Module Methods**
        - [X] **Chart Configuration – Getters**
            - [X] `theme`: Get current chart theme ("light"|"dark")
            - [X] `textColor`: Get current text color
            - [X] `barColors`: Get array of bar colors
            - [X] `categories`: Get x-axis categories
            - [X] `dataSet`: Get chart data series
        - [X] **Chart Configuration – Setters**
            - [X] `setTheme`: Update chart theme
            - [X] `setTextColor`: Update text color
            - [X] `setBarColors`: Update bar colors array
            - [X] `setCategories`: Update x-axis categories
            - [X] `setDataSet`: Update chart data series
        - [X] **Chart Rendering & Lifecycle**
            - [X] `render()`: Create or update chart visualization
                - [X] Auto-handles initial render and updates
                - [X] Listens for `themeChanged` custom events
            - [X] `destroy()`: Clean up chart instance
                - [X] Removes event listeners
                - [X] Destroys ApexCharts instance
        - [X] **Rendering & Lifecycle**
            - [X] CSS variable support for colors
                - [X] Automatic conversion of CSS variables to computed values
                - [X] Fallback to #000000 for invalid variables
            - [X] Theme synchronization
                - [X] Reactive to system theme changes
                - [X] Dynamic re-rendering on theme updates
- [X] **Dashboard Module Implementation**
    - [X] **Core Initialization**
        - [X] Requires base API endpoint and NavigationHandler instance
        - [X] Throws error if dashboard element not found
    - [X] **Chart Configuration Proxy**
        - [X] **Getters**
            - [X] `chartTextColor`: Get current chart text color
            - [X] `chartBarColors`: Get array of chart bar colors
            - [X] `chartTheme`: Get current chart theme ("light"|"dark")
        - [X] **Setters**
            - [X] `setChartTextColor`: Update chart text color
            - [X] `setChartBarColors`: Update chart bar colors
            - [X] `setChartTheme`: Update chart theme
    - [X] **Data Management**
        - [X] `fetchStats()`: Retrieves stats from backend API
            - [X] Handles network errors
            - [X] Manages credentials
        - [X] `load()`: Main loading method
            - [X] Fetch website stats and update the DOM
            - [X] Returns HTTP promise
    - [X] **UI Updaters**
        - [X] `updateStatsCards()`: Updates all statistic cards
        - [X] `updateProjection()`: Configures and renders chart
        - [X] `updateLeaderBoard()`: Dynamically builds leaderboard
            - [X] Creates ranked player list
            - [X] Generates profile links
            - [X] Loads player images
        - [X] `updateActivities()`: Renders game history
            - [X] Adds game-specific icons
            - [X] Formats match results
            - [X] Displays timestamps
    - [X] **Event Handling**
        - [X] Automatic refresh button binding
        - [X] Chart cleanup on refresh
- [X] **Profile Loader Implementation**
    - [X] **Core Initialization**
        - [X] Requires base API endpoint and NavigationHandler instance
        - [X] Throws error if profile element not found
    - [X] **Chart Configuration Proxy**
        - [X] **Getters**
            - [X] `chartTextColor`: Get current chart text color
            - [X] `chartBarColors`: Get array of chart bar colors
            - [X] `chartTheme`: Get current chart theme ("light"|"dark")
        - [X] **Setters**
            - [X] `setChartTextColor`: Update chart text color
            - [X] `setChartBarColors`: Update chart bar colors
            - [X] `setChartTheme`: Update chart theme
    - [X] **Data Management**
        - [X] `fetchStats()`: Retrieves stats from backend API
            - [X] Handles both current user and specified user profiles
            - [X] Manages URL parameter parsing (?id=)
            - [X] Handles network errors
            - [X] Manages credentials
        - [X] `load()`: Main loading method
            - [X] Fetch profile stats and update the DOM
            - [X] Returns HTTP promise
    - [X] **UI Updaters**
        - [X] `updateProfileInfo()`: Updates user information
            - [X] Handles profile picture
            - [X] Updates name, ID, and email
            - [ ] Handle action buttons (block, unblock, accept...)
        - [X] `updateStats()`: Updates game statistics
            - [X] Total games played
            - [X] Total games won
            - [X] Total games lost
        - [X] `updateProjection()`: Configures and renders chart
            - [X] Shows games played per type
            - [X] Shows wins per game type
            - [X] Handles null data safely
        - [X] `updateActivities()`: Renders game history
            - [X] Creates victory/defeat entries
            - [X] Adds game-specific icons
            - [X] Formats match results
            - [X] Displays timestamps
            - [X] Shows empty state when no history
- [X] **Theme Manager Implementation**
    - [X] **Core Initialization**
        - [X] Optional theme button ID parameter (default: "mode-toggle")
        - [X] Automatic theme detection on instantiation
        - [X] Auto-binds click handler when button exists
    - [X] **Theme Management**
        - [X] **State Getters**
            - [X] `currentTheme`: Get active theme ("light"|"dark")
            - [X] `getSystemTheme`: Detect OS-level preference
            - [X] `getCachedTheme`: Retrieve stored preference
        - [X] **State Setters**
            - [X] `setTheme`: Programmatically set new theme
                - [X] Persists to localStorage
                - [X] Triggers UI updates
                - [X] Broadcasts change event
        - [X] `toggleTheme()`: Switch between light/dark modes
    - [X] **UI Synchronization**
        - [X] `updateThemeButton()`: Dynamically updates toggle icon
            - [X] Show sun icon for dark mode
            - [X] Show moon icon for light mode
        - [X] `updateWebSite()`: Applies theme globally
            - [X] Sets `data-theme` attribute
            - [X] Updates button state
            - [X] Broadcasts "themeChanged" event
    - [X] **Persistence**
        - [X] Automatic localStorage management
        - [X] Falls back to system preference
        - [X] Validates stored values
- [X] **NavBar Handler Implementation**
    - [X] **Core Initialization**
        - [X] Requires base API endpoint and NavigationHandler instance
    - [X] **Element References**
        - [X] Side navigation container
        - [X] Side nav toggle button
        - [X] Fullscreen toggle button
        - [ ] Search Box
        - [X] Logout button
    - [X] **Feature Implementation**
        - [X] **Side Navigation**
            - [X] Toggle visibility with animation (`toggleSideNav`)
            - [X] Handles width transition smoothly
            - [X] Manages hidden state
        - [X] **Fullscreen Management**
            - [X] Toggle fullscreen mode (`toggleFullScreen`)
            - [X] Cross-browser event support
            - [X] Dynamic button icon updates (`updateScreenButton`)
        - [X] **Session Management**
            - [X] Logout functionality (`logoutSession`)
            - [X] Automatic redirect to login page
        - [ ] **Search Functionality**
            - [ ] redirect to search page on submit
- [ ] **Buttons Action Module Implementation** (@oussamakami)
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
- [X] **Friend Requests Data**
    - [X] **Table Structure**
        - [X] `sender_id` → INTEGER, FOREIGN KEY (references `Users.id`)
        - [X] `recipient_id` → INTEGER, FOREIGN KEY (references `Users.id`)
        - [X] `status` → TEXT (`pending`, `accepted`, `blocked`)
    - [X] **Methods**
        - [X] Send a friend request
        - [X] Accept a friend request
        - [X] Reject a friend request (removes the row)
        - [X] Unfriend a user (removes the row)
        - [X] Retrieve a user's friends list (includes both pending and accepted)
        - [X] Retrieve all accepted friend requests for a user
        - [X] Retrieve all pending friend requests for a user
        - [X] Block a user
        - [X] Unblock a user (removes the row, same as rejection)
        - [X] Search for users (fetch from `Users` table, excluding blocked users)
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
- [X] users/`:userId` **GET**
    - [X] Takes target user ID in URL
    - [X] Verifies requesting user has valid session
    - [X] Checks if requesting user is blocked
    - [X] Returns target user's game statistics if authorized
    - [X] Shows win/loss records per game type
    - [X] Includes recent match history with opponents
    - [X] Returns appropriate error if not found/blocked

### Security
- [ ] Pretect against **Cross-Site Scripting (XSS)**
- [X] Pretect against **SQL Injection**
- [X] Implement a custom hashing algorithm
- [ ] Implement/Enforce **HTTPS** communication

# Authors

- Oussama Kamili [@oussamakami](https://github.com/oussamakami)

- Salah Eddine Lazar [@slazar42](https://github.com/slazar42)

- Abdellah amardoul [@loudrama](https://github.com/loudrama)

- Anas Kheireddine [@kheireddine-anas](https://github.com/kheireddine-anas)

# License
This Project Is Licensed Under &copy; [**MIT**](./LICENSE)
