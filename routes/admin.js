const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('./db'); // CORRECTED: The path is now './db'
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Middleware to check if the user is an administrator
function checkAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.email === 'admin@moodtune.com.au') {
        return next();
    }
    // If not an admin, redirect to the home page
    res.redirect('/');
}

// GET admin dashboard page
router.get('/', checkAdmin, (req, res) => {
    // Use path.join to create a reliable, absolute path to the HTML file
    res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// GET all users for the admin dashboard
router.get('/users', checkAdmin, (req, res) => {
    // Note: your schema uses 'name' not 'username'. Correcting query.
    const sql = 'SELECT user_id, name as username, email, date_of_birth, address, created_at FROM Users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database Query Error:', err);
            return res.status(500).json({ message: 'Error fetching users from database.' });
        }
        res.json(results);
    });
});

// GET a single user by ID (for editing)
router.get('/users/:id', checkAdmin, (req, res) => {
  const userId = req.params.id;
  const sql = `
    SELECT user_id, name AS username, email, date_of_birth, address, is_admin
    FROM Users
    WHERE user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Fetch user error:', err);
      return res.status(500).json({ message: 'Error fetching user data' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
});

// CREATE a new user
const multer = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/avatars/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  })
});

router.post('/users', checkAdmin, upload.single('avatar'), async (req, res) => {
  const {
    username, email, password, confirm_password,
    date_of_birth, address
  } = req.body;
  const is_admin = req.body.is_admin === 'on' ? 1 : 0;

  if (!username || !email || !password || !confirm_password || !date_of_birth || !address) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const sql = `
      INSERT INTO Users (user_id, name, email, password, created_at, date_of_birth, address, avatar, is_admin)
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)
    `;

    db.query(sql, [userId, username, email, hashedPassword, date_of_birth, address, avatarPath, is_admin], (err, result) => {
      if (err) {
        console.error('Database Insert Error:', err);
        return res.status(500).json({ message: 'Error creating user.' });
      }
      res.status(201).json({ message: 'User created successfully.' });
    });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// UPDATE a user's details
router.put('/users/:id', checkAdmin, upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const {
    username, email, password, date_of_birth, address
  } = req.body;
  const is_admin = req.body.is_admin === 'on' ? 1 : 0;

  if (!username || !email || !date_of_birth || !address) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    let fields = ['name = ?', 'email = ?', 'date_of_birth = ?', 'address = ?', 'is_admin = ?'];
    let values = [username, email, date_of_birth, address, is_admin];

    // Optional: password update
    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    // Optional: avatar update
    if (req.file) {
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      fields.push('avatar = ?');
      values.push(avatarPath);
    }

    values.push(id); // where clause value

    const sql = `UPDATE Users SET ${fields.join(', ')} WHERE user_id = ?`;
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Database Update Error:', err);
        return res.status(500).json({ message: 'Error updating user.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json({ message: 'User updated successfully.' });
    });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// DELETE a user
router.delete('/users/:id', checkAdmin, (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM Users WHERE user_id = ?';

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Database Delete Error:', err);
            return res.status(500).json({ message: 'Error deleting user.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User deleted successfully.' });
    });
});

module.exports = router;
