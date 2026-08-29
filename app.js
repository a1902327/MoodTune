const session = require('express-session');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const helmet = require('helmet');

// Routers
const adminRouter = require('./routes/admin');
const profileRouter = require('./routes/profile');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const spotifyRouter = require('./routes/spotify');

const app = express();

// Load environment variables
dotenv.config();

// --- Middleware Setup ---
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Security and Session Middleware (Order is important)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    },
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.use(require('express-flash')());
app.use(require('passport').initialize());
app.use(require('passport').session());
app.use(require('method-override')('_method'));

// --- Mount Routers ---
// This must come AFTER the middleware setup
app.use('/admin', adminRouter);
app.use('/profile', profileRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/spotify', spotifyRouter);

module.exports = app;