var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage: storage });

// --- Middleware ---

// For page navigation (redirects on failure)
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/users/login');
}

// For page navigation (redirects on success)
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return res.redirect('/');
  next();
}

// FIX: New middleware for API requests (sends JSON error on failure)
function checkApiAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Authentication required. Please log in.' });
}

// Initialize passport
const initializePassport = require('../passport-config');
initializePassport(passport);

/* GET register page */
router.get('/register', checkNotAuthenticated, (req, res) => {
  const errorMessages = req.flash('error');
  const errorParam = errorMessages.length ? `?error=${encodeURIComponent(errorMessages[0])}` : '';
  res.redirect(`/RegisterPage.html${errorParam}`);
});

/* POST register */
router.post(
  '/register',
  upload.single('avatar'),
  checkNotAuthenticated,
  [
    body('username').trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    body('date_of_birth').isDate().withMessage('Invalid date of birth'),
    body('address').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg));
      return res.redirect('/users/register');
    }

    const { username, email, password, date_of_birth, address } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : null;

      const sql = `
        INSERT INTO Users (user_id, name, email, password, created_at, date_of_birth, address, avatar, is_admin)
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, 0)
      `;

      db.query(sql, [userId, username, email, hashedPassword, date_of_birth, address, avatarPath], (err, result) => {
        if (err) {
          console.error('Database Insert Error:', err);
          if (err.code === 'ER_DUP_ENTRY') {
            req.flash('error', 'That name or email is already in use.');
          } else {
            req.flash('error', 'Registration failed. Please try again.');
          }
          return res.redirect('/users/register');
        }
        res.redirect('/users/login');
      });
    } catch (err) {
      console.error('Registration Error:', err);
      req.flash('error', 'Something went wrong. Please try again.');
      res.redirect('/users/register');
    }
  }
);

/* GET login page */
router.get('/login', checkNotAuthenticated, (req, res) => {
  const errorMessages = req.flash('error');
  const error = errorMessages.length ? 'invalid_credentials' : '';
  res.redirect(`/LoginPage.html${error ? '?error=' + encodeURIComponent(error) : ''}`);
});

/* POST login */
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}));

/* DELETE logout */
router.delete('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect('/users/login');
  });
});

// --- API Routes ---

// FIX: GET /users/status - Check authentication status and role
router.get('/status', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({
      loggedIn: true,
      user: {
        user_id: req.user.user_id,
        username: req.user.name,
        email: req.user.email,
        is_admin: req.user.is_admin || 0 // Ensures is_admin is always present
      }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get('/api/profile', checkApiAuthenticated, (req, res) => {
    try {
        const user = {
            userId: req.user.user_id,
            name: req.user.name,
            email: req.user.email,
            dateOfBirth: req.user.date_of_birth ? new Date(req.user.date_of_birth).toLocaleDateString() : 'Not provided',
            rawDateOfBirth: req.user.date_of_birth, // This raw date is for the <input type="date">
            address: req.user.address || 'Not provided',
            avatar: req.user.avatar || '/images/default-avatar.png'
        };

        const savedSongsQuery = 'SELECT * FROM SavedTracks WHERE user_id = ? ORDER BY saved_at DESC';
        db.query(savedSongsQuery, [req.user.user_id], (err, songs) => {
            if (err) {
                console.error('Error fetching saved songs:', err);
                return res.status(500).json({ message: 'Error fetching your saved songs.' });
            }
            res.json({ user, savedSongs: songs });
        });
    } catch (error) {
        console.error('Error in profile data route:', error);
        res.status(500).json({ message: 'Internal server error while building profile.' });
    }
});

router.post('/api/save-track', checkApiAuthenticated, (req, res) => {
    const { id, name, artist, album, artwork, spotify_url } = req.body;
    const userId = req.user.user_id;

    if (!id || !name || !artist) {
        return res.status(400).json({ message: 'Missing essential track information.' });
    }

    const sql = `
        INSERT INTO SavedTracks (user_id, spotify_track_id, track_name, artist, album, artwork, spotify_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE spotify_track_id=spotify_track_id`;

    const values = [userId, id, name, artist, album, artwork, spotify_url];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('DB Error saving track:', err);
            return res.status(500).json({ message: 'Failed to save track.' });
        }
        res.status(201).json({ message: 'Track saved!' });
    });
});

router.delete('/api/saved-track/:trackId', checkApiAuthenticated, (req, res) => {
    const { trackId } = req.params;
    const userId = req.user.user_id;

    if (!trackId) {
        return res.status(400).json({ message: 'Missing track ID.' });
    }

    const sql = 'DELETE FROM SavedTracks WHERE user_id = ? AND spotify_track_id = ?';
    db.query(sql, [userId, trackId], (err, result) => {
        if (err) {
            console.error('DB Error deleting track:', err);
            return res.status(500).json({ message: 'Failed to remove track.' });
        }
        res.status(200).json({ message: 'Track removed.' });
    });
});

router.put('/api/profile', checkApiAuthenticated, [
    // Add validation for the incoming data
    body('name').not().isEmpty().trim().escape().withMessage('Username cannot be empty.'),
    body('date_of_birth').isISO8601().toDate().withMessage('Invalid date format.'),
    body('address').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, date_of_birth, address } = req.body;
    const userId = req.user.user_id;

    const sql = `
        UPDATE Users
        SET name = ?, date_of_birth = ?, address = ?
        WHERE user_id = ?
    `;

    db.query(sql, [name, date_of_birth, address, userId], (err, result) => {
        if (err) {
            console.error('Database Update Error:', err);
            // Handle specific errors like duplicate username if 'name' must be unique
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'That username is already taken.' });
            }
            return res.status(500).json({ message: 'Failed to update profile due to a server error.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ message: 'Profile updated successfully!' });
    });
});

module.exports = router;
