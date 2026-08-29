var express = require('express');
var router = express.Router();
const spotifyApi = require('../spotify-api');
const db = require('./db');

/**
 * Middleware to check if a user is authenticated for an API request.
 * If not authenticated, it sends a 401 Unauthorized response with a JSON
 * message, preventing further execution.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @param {function} next The next middleware function.
 */
function checkApiAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Please log in to rate songs.' });
}


// --- UNCHANGED ROUTES ---
// (The /login, /callback, /search, and /recommendations routes remain the same as in your file)
router.get('/login', (req, res) => {
    if (!spotifyApi.getClientId()) {
        return res.status(500).send('Spotify API client ID is not configured. Please set CLIENT_ID in .env');
      }
      const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state'];
      const authUrl = spotifyApi.createAuthorizeURL(scopes);
      console.log('Generated Spotify Auth URL:', authUrl);
      res.redirect(authUrl);
    });

router.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi.authorizationCodeGrant(code).then(data => {
    const accessToken = data.body['access_token'];
    const refreshToken = data.body['refresh_token'];
    const expiresIn = data.body['expires_in'];

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);
    req.session.spotifyAccessToken = accessToken;
    req.session.spotifyRefreshToken = refreshToken;

    console.log('The access token is ' + accessToken);
    res.redirect('/');

    setInterval(async () => {
      try {
        const data = await spotifyApi.refreshAccessToken();
        const accessTokenRefreshed = data.body['access_token'];
        spotifyApi.setAccessToken(accessTokenRefreshed);
        req.session.spotifyAccessToken = accessTokenRefreshed;
      } catch (err) {
        console.error('Token Refresh Error:', err);
      }
    }, expiresIn / 2 * 1000);
  }).catch(error => {
    console.error('Error getting Tokens:', error);
    res.send('Error getting tokens');
  });
});

router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(400).json({ message: 'Missing search query' });
  }
  if (!spotifyApi.getAccessToken()) {
    return res.status(401).json({ message: 'Not authenticated with Spotify.' });
  }

  try {
    const searchData = await spotifyApi.searchTracks(q);
    const tracks = searchData.body.tracks.items;

    if (!tracks || tracks.length === 0) {
      return res.json({ tracks: [] });
    }

    const trackList = tracks.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      artwork: track.album.images?.[0]?.url || 'https://placehold.co/150x150?text=No+Art',
      spotify_url: track.external_urls?.spotify || '#'
    }));

    res.json({ tracks: trackList });
  } catch (err) {
    console.error('Spotify Search Error:', err);
    res.status(500).json({ message: 'Error occurred during search' });
  }
});

router.get('/recommendations', async (req, res) => {
  const { mood } = req.query;

  if (!mood || mood.trim() === '') {
    return res.status(400).json({ message: 'Missing mood keyword' });
  }
  if (!spotifyApi.getAccessToken()) {
    return res.status(401).json({ message: 'Not authenticated with Spotify.' });
  }

  const moodKeywords = {
    happy: 'feel good upbeat fun sunshine joy smile party cheerful celebration happy',
    sad: 'sad heartbreak lonely crying broken missing you lost sorrow tears pain',
    energetic: 'energetic hype workout dance power intense fast pump running boost',
    relaxed: 'relaxed chill calm mellow smooth acoustic peaceful easy soft unwind',
    focused: 'focused concentration study lo-fi instrumental ambient deep work thinking coding'
  };
  const keyword = moodKeywords[mood.toLowerCase()] || mood;

  try {
    const searchData = await spotifyApi.searchTracks(keyword, { limit: 12, market: 'AU' });
    const tracks = searchData.body.tracks.items;

    if (!tracks.length) {
      return res.json({ tracks: [] });
    }

    const results = tracks.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      artwork: track.album.images?.[0]?.url || 'https://placehold.co/150x150?text=No+Art',
      spotify_url: track.external_urls?.spotify || '#'
    }));

    res.json({ tracks: results });
  } catch (err) {
    console.error('Mood Search Error:', err);
    res.status(500).json({ message: 'Failed to search by mood' });
  }
});


// --- UPDATED LIKE/DISLIKE ROUTES ---

// Like a song - Now protected by checkApiAuthenticated
router.post('/:id/like', checkApiAuthenticated, (req, res) => {
  const songId = req.params.id;
  // The middleware guarantees req.user exists, so we can use it safely.
  const userId = req.user.user_id;

  db.query(
    `INSERT INTO Feedbacks (user_id, spotify_track_id, thumbs_up)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE thumbs_up = 1`,
    [userId, songId],
    (err) => {
      if (err) {
        console.error('DB error on like:', err);
        return res.status(500).json({ message: 'Database error while liking song.' });
      }
      res.json({ success: true });
    }
  );
});

// Dislike a song - Now protected by checkApiAuthenticated
router.post('/:id/dislike', checkApiAuthenticated, (req, res) => {
  const songId = req.params.id;
  const userId = req.user.user_id;

  db.query(
    `INSERT INTO Feedbacks (user_id, spotify_track_id, thumbs_up)
     VALUES (?, ?, 0)
     ON DUPLICATE KEY UPDATE thumbs_up = 0`,
    [userId, songId],
    (err) => {
      if (err) {
        console.error('DB error on dislike:', err);
        return res.status(500).json({ message: 'Database error while disliking song.' });
      }
      res.json({ success: true });
    }
  );
});

module.exports = router;
