var express = require('express');
var router = express.Router();

/* GET home page */
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/users/login');
}

router.get('/', checkAuthenticated, (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

module.exports = router;
