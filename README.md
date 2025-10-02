# GamePad

`GamePad` is a social gaming website that lets users create accounts, play interactive games like Tic Tac Toe, Ping Pong, and Rock-Paper-Scissors, and compete on leaderboards with detailed player statistics. The platform includes robust user and friendship management, real-time chat via `WebSockets`, and session control with device, browser, and IP insights. Security features include 2FA (email & TOTP with QR codes), OAuth2 login with Google, and JWT-based authentication. Users receive live notifications for friend requests and messages, making `GamePad` a complete social gaming experience.

## 🚀 Key Features

- **Leaderboards & Statistics** – Track scores, rankings, and detailed player stats.
- **User Management** – Create accounts, update profiles, and manage authentication securely.
- **Friendship System** – Add, remove, block/unblock friends, and see who’s online.
- **Real-Time Chat** – WebSocket-based live messaging with notifications.
- **Session Management** – View active sessions by browser, IP, and device; revoke sessions directly from settings.
- **Two-Factor Authentication (2FA)** – Supports both email codes and TOTP authenticators with QR generation.
- **Multiplayer Games** – Play Tic Tac Toe, Ping Pong, and Rock-Paper-Scissors with other users.
- **Notifications System** – Receive alerts for friend requests, chat messages, and other social interactions.
- **AJAX-Driven UI** – Smooth and dynamic updates without full page reloads.
- **JWT Authentication** – Token-based access for secure and stateless API requests.
- **Custom Security Layer** – Custom serial class for secure requests and a hashing algorithm following best practices.
- **Dockerized Deployment** – Fully containerized with Docker and Docker Compose for easy setup.

## 🛠️ Getting Started

You can run `GamePad` using **Docker Compose** (recommended) or directly with **Node.js v18+**.

- ### Clone the Repository

    ```sh
    git clone https://github.com/oussamakami/gamepad
    cd gamepad
    ```

- ### Setup Environment Variables

    Before running the project, you **must** configure the **`.env`** file.

    ```sh
    cp .env.example .env
    ```

    Then edit **`.env`** and update the values for your setup (see the [Environment Variables](#%EF%B8%8F-environment-variables)
    section for detailed explanations).

- ### Running with Docker (Recommended):

    `GamePad` includes a `Makefile` for easy container management.

    - **1 - Prerequisites**

        Make sure the following packages are installed: **Make**, **Docker & Docker Compose**

        - **Make - Debian-based (Ubuntu, Linux Mint, etc.)**:

            ```sh
            sudo apt update && sudo apt install make
            ```

        - **Make - Arch-based (Arch, Manjaro, etc.)**:

            ```sh
            sudo pacman -S make
            ```

        - **Docker CLI**

            ```sh
            docker --version
            ```

            > Visit [Docker Engine Instalation](https://docs.docker.com/engine/install/) for instructions.

        - **Docker Compose**

            ```sh
            docker compose version
            ```
            or
            ```sh
            docker-compose version
            ```

            > Visit [Docker Compose Installation](https://docs.docker.com/compose/install/) for instructions.

    - **2 - Start the project**:

        You can start the project in two ways, depending on your `SSL` setup:

        - **Option A: Generate a self-signed SSL certificate**  
            This will automatically create and use a self-signed certificate:

            ```sh
            make ssl start
            ```

        - **Option B: Use your own SSL certificate**  
            Place your certificate and private key files in `docker/nginx/ssl/` with the following names:

            - `cert.pem` → your SSL certificate  
            - `privkey.pem` → your private key  

            Then simply run:

            ```sh
            make start
            ```

    - **3 - Useful commands**:

        - **Restart containers**:

            ```sh
            make restart
            ```

        - **View logs**:

            ```sh
            make logs TARGET=api
            ```

        - **Clean everything** (containers, images, volumes, build cache):

            ```sh
            make fclean
            ```
        - **View full list of commands**:

            ```sh
            make help
            ```

- ### Running without Docker (Node.js v18+):

    - **1 - Prerequisites**

        Make sure the following packages are installed: **NPM & Node.js v18+**

        - **NPM**

            ```sh
            npm --version
            ```

        - **Node**

            ```sh
            node --version
            ```

            > Visit [NodeJs Download](https://nodejs.org/en/download) for instructions.

    - **2 - Install dependencies**:

        ```sh
        npm install
        ```

    - **3 - Build the frontend**:

        ```sh
        npm run build
        ```

    - **4 - Serve the frontend**:

        Use **Nginx** to:
        - Serve static files from the `front-end/` directory.
        - Proxy `/api/...` requests to the API server.

        Use the config file `docker/nginx/assets/default.conf` as a reference.
    - **5 - Start the API server**

        ```sh
        npm start
        ```

        > ⚠️ Remember: your **`.env`** must be configured before running.


## ⚙️ Environment Variables

`GamePad` requires a `.env` file in the project root. Below is the full configuration with **detailed explanations** and **example values**.

- ### Core Configuration
    
    ```sh
    # API server port
    PORT="3000"
    
    # Maximum uploaded profile picture size (bytes)
    # Example: 2MB = 2 * 1024 * 1024 = 2097152
    MAX_FILE_SIZE="2097152"
    
    # JWT secret for signing tokens
    # Must be a secure, random 64-character string
    JWT_SECRET="f4e8c7a91d3b2c56e7f8a1d9c6b3a2f4e9d1c8b7a6e5d4c3b2a1f9e8d7c6b5a4"
    
    # Absolute path where profile pictures and database are stored
    CLIENTS_DATA_PATH="/home/ubuntu/gamepad/clientsData"
    
    # Default profile pictures (files must exist in CLIENTS_DATA_PATH)
    DEFAULT_PICTURES="default1.webp,default2.webp,default3.webp"
    
    # Frontend URL (used for CORS)
    FRONTEND_ORIGIN="127.0.0.1"
    ```

    ---

- ### SMTP Configuration (Optional – enables email features like 2FA & password reset)

    ```sh
    # SMTP server host
    SMTP="smtp.gmail.com"
    
    # SMTP server port
    SMTP_PORT="465"
    
    # SMTP account credentials
    SMTP_USER="your-email@gmail.com"
    SMTP_PASS="your-smtp-password-or-app-password"
    ```

    - **📌 Important**:
        If you use Gmail, create an App Password in your Google account security settings and paste it as SMTP_PASS.

    ---

- ### Google OAuth2 (Optional – enables login with Google)

    ```sh
    # Google OAuth2 credentials (from Google Cloud Console)
    CLIENT_ID="1234567890-abcdefg.apps.googleusercontent.com"
    CLIENT_SECRET="your-google-client-secret"
    ```
    - **📌 Important**:
        Your OAuth2 callback URL must be: `http://127.0.0.1/api/auth/google/callback`

        (replace `127.0.0.1` with your actual frontend origin).

    ---

- ### Fake Data (Optional – for development & testing)

    ```sh
    # Enable fake data generation (true/false)
    FAKE_DATA_MODE="true"
    
    # Number of fake users to create (max 1500)
    FAKE_USERS_COUNT="50"
    
    # Number of fake activities between fake users (max 15000)
    FAKE_ACTIVITIES_COUNT="200"
    
    # How many fake users should have their credentials displayed (max 10)
    FAKE_USERS_CREDENTIALS_DISPLAY="3"
    ```
    - **📌 Important**:
        With the above settings, the system will generate 50 fake users and 200 fake activities, and print credentials for 3 of them so you can log in and test the app.
    
    ---

- ### Notes

    - `CLIENTS_DATA_PATH` must be absolute and writable. Example: `/var/lib/gamepad/data`.

    - `JWT_SECRET` should be generated once and kept safe. Example:
        ```sh
        openssl rand -hex 32
        ```

    - If you skip `SMTP` or `OAuth2` configuration, those features are simply disabled.

## 🤝 Authors

- Oussama Kamili [@oussamakami](https://github.com/oussamakami)

- Salah Eddine Lazar [@slazar42](https://github.com/slazar42)

- Abdellah amardoul [@loudrama](https://github.com/loudrama)

- Anas Kheireddine [@kheireddine-anas](https://github.com/kheireddine-anas)

## 📝 License

This Project Is Licensed Under &copy; [**MIT**](./LICENSE)