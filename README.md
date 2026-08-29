# MoodTune

MoodTune is a Node.js and Express web application that connects your mood with Spotify music recommendations. Users can register accounts, manage a personal profile, and save their favourite tracks. The app integrates with the Spotify API to perform searches and generate playlists based on a selected mood.

## Setup

1. **Install dependencies**
   
   Install a package for managing user sessions
   ```bash
   npm install express-session
   ```
   Allows universally unique identifiers generation
   ```bash
   npm install uuid 
   ```
   Allows password hashing for security
   ```bash
   npm install bcrypt
   ```
   Allows communication between the application and Spotify
   ```bash
   npm install spotify-web-api-node
   ```
   Install a security package to prevent XSS, clickjacking, etc.
   ```bash
   npm install helmet
   ```
   Install middleware to handle file uploads
   ```bash
   npm install multer
   ```
2. **Setting Up the MySQL Database**
   
   Start the MySQL database
   ```bash
   sudo service mysql start
   ```

   Log into MySQL shell and changes the authentication method for the root user. Access password: alex
   ```bash
   sudo mysql -u root -p
   ```
   ```bash
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'alex';
   FLUSH PRIVILEGES;
   EXIT;
   ```
   Create a new, empty database named moodtune.
   ```bash
   mysql -u root -p -e "CREATE DATABASE moodtune"
   ```
   Load the SQL script from a specified path and import into moodtune database.
   ```bash
   mysql -u root -p moodtune < 'path to moodtune.sql'
   ```
4. **Create a `.env` file** in the project root with values for the following variables:
   - `SESSION_SECRET` – secret for Express sessions
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – MySQL connection settings
   - `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URL` – Spotify API credentials
5. **Start the application server**
   ```bash
   npm start
   ```
   or run `npm run dev` to start the server with nodemon for automatic restarts.

The server listens on port `8080` by default.

## Features

- User registration and login with hashed passwords
- Profile page with editable information and avatar uploads
- Spotify authentication and search
- Mood‑based track recommendations
- Ability to save songs and manage your own list
- Like/dislike feedback for songs
- Admin dashboard for managing users

## Known Issues / Limitations

- Credentials for the Spotify API are printed to the console in `spotify-api.js` which should be removed for production use.
- There are currently no automated tests.
