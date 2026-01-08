require('dotenv').config();

module.exports = {
  clientId: process.env.FT_CLIENT_UID,
  clientSecret: process.env.FT_CLIENT_SECRET,
  redirectUri: process.env.FT_REDIRECT_URI,
  authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
  tokenURL: 'https://api.intra.42.fr/oauth/token',
  apiURL: 'https://api.intra.42.fr/v2'
};