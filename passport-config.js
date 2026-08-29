const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
// **THE FIX IS HERE**: Corrected the path to point into the 'routes' folder.
const db = require('./routes/db');

function initialize(passport) {
  const authenticateUser = (email, password, done) => {
    // Find user by email
    db.query('SELECT * FROM Users WHERE email = ?', [email], async (err, results) => {
      if (err) return done(err);
      if (results.length === 0) {
        return done(null, false, { message: 'No user with that email' });
      }

      const user = results[0];
      try {
        // Compare password
        if (await bcrypt.compare(password, user.password)) {
          return done(null, user); // Passwords match, return user
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      } catch (e) {
        return done(e);
      }
    });
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

  // Store user ID in the session
  passport.serializeUser((user, done) => done(null, user.user_id));

  // Retrieve user from the session using the ID
  passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM Users WHERE user_id = ?', [id], (err, results) => {
      if (err) return done(err);
      return done(null, results[0]);
    });
  });
}

module.exports = initialize;
