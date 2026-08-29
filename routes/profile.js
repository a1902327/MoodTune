const express = require('express');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const path = require('path');

// Multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/avatars/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });

// Middleware to check authentication for API
function checkApiAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Authentication required. Please log in.' });
}

router.use(checkApiAuthenticated);

// GET /profile
router.get('/', (req, res) => {
  const user = {
    userId: req.user.user_id,
    name: req.user.name,
    email: req.user.email,
    rawDateOfBirth: req.user.date_of_birth,
    dateOfBirth: req.user.date_of_birth ? new Date(req.user.date_of_birth).toLocaleDateString() : 'Not provided',
    address: req.user.address || 'Not provided',
    avatar: req.user.avatar || '/images/default-avatar.png'
  };

  const sql = 'SELECT * FROM SavedTracks WHERE user_id = ? ORDER BY saved_at DESC';
  db.query(sql, [req.user.user_id], (err, songs) => {
    if (err) return res.status(500).json({ message: 'Error fetching your saved songs.' });
    res.json({ user, savedSongs: songs });
  });
});

// PUT /profile (with avatar support)
router.put('/', upload.single('avatar'), (req, res) => {
  const { name, date_of_birth, address } = req.body;
  const userId = req.user.user_id;
  const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : req.user.avatar;

  if (!name || !date_of_birth) {
    return res.status(400).json({ message: 'Name and Date of Birth are required.' });
  }

  const sql = `
    UPDATE Users
    SET name = ?, date_of_birth = ?, address = ?, avatar = ?
    WHERE user_id = ?`;

  const values = [name, date_of_birth, address || null, avatarPath, userId];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error updating profile.' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });

    req.user.name = name;
    req.user.date_of_birth = date_of_birth;
    req.user.address = address;
    req.user.avatar = avatarPath;

    res.status(200).json({ message: 'Profile updated successfully!' });
  });
});

// POST /profile/save-track
router.post('/save-track', (req, res) => {
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
    if (err) return res.status(500).json({ message: 'Failed to save track due to a server error.' });
    res.status(result.affectedRows > 0 ? 201 : 200).json({ message: result.affectedRows > 0 ? 'Track saved!' : 'Track already saved.' });
  });
});

// DELETE /profile/saved-track/:trackId
router.delete('/saved-track/:trackId', (req, res) => {
  const { trackId } = req.params;
  const userId = req.user.user_id;

  const sql = 'DELETE FROM SavedTracks WHERE user_id = ? AND spotify_track_id = ?';
  db.query(sql, [userId, trackId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to remove track.' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Track not found.' });
    res.status(200).json({ message: 'Track removed.' });
  });
});

module.exports = router;
