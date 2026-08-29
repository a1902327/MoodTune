const db = require('./routes/db');

const insertUser = `
  INSERT INTO Users (user_id, username, email, password, favorite_mood, created_at)
  VALUES (UUID(), 'testuser4', 'test4@example.com', 'hashedpassword', 'happy', NOW());
`;

const insertAdminSetting = `
  INSERT INTO Admin (setting_id, \`key\`, value, description)
  VALUES
    (UUID(), 'filter_explicit_content', 'true', 'Hide songs marked as explicit');
`;

const insertMoodHistory = `
  INSERT INTO Mood_history (user_id, mood, timestamp)
  VALUES
    ((SELECT user_id FROM Users WHERE email='test3@example.com'), 'happy', NOW()),
    ((SELECT user_id FROM Users WHERE email='test3@example.com'), 'relaxed', NOW());
`;

const insertPlaylist = `
  INSERT INTO Playlists (playlist_id, user_id, mood, name, created_at)
  VALUES
    (UUID(), (SELECT user_id FROM Users WHERE email='test3@example.com'), 'happy', 'Feel Good Mix', NOW());
`;

const insertTrack = `
  INSERT INTO Tracks (track_id, playlist_id, spotify_track_id, track_name, artist, album, valence, energy, danceability)
  VALUES
    (UUID(),
     (SELECT playlist_id FROM Playlists WHERE name='Feel Good Mix'),
     '6habFhsOp2NvshLv26DqMb',
     'Happy',
     'Pharrell Williams',
     'G I R L',
     0.9, 0.8, 0.7);
`;

// Chain queries
db.query(insertUser, (err) => {
  if (err) throw err;
  console.log('✅ User inserted');

  db.query(insertAdminSetting, (err) => {
    if (err) throw err;
    console.log('✅ Admin setting inserted');

    db.query(insertMoodHistory, (err) => {
      if (err) throw err;
      console.log('✅ Mood history inserted');

      db.query(insertPlaylist, (err) => {
        if (err) throw err;
        console.log('✅ Playlist inserted');

        db.query(insertTrack, (err) => {
          if (err) throw err;
          console.log('✅ Track inserted');
          db.end();
        });
      });
    });
  });
});
