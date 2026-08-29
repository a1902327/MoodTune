require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');

console.log('CLIENT_ID:', process.env.CLIENT_ID); // Debug log
console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET);
console.log('REDIRECT_URL:', process.env.REDIRECT_URL);

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URL
});

module.exports = spotifyApi;