const env = require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node'); //3rd party Spotify npm package
const https = require('https');

//variables for auth
const scopes = ['user-read-private', 'user-read-email'],
  redirectUri = 'https://lyrical-visual.herokuapp.com/callback',
  clientId = String(process.env.CLIENT_ID), 
  clientSecret = String(process.env.CLIENT_SECRET),
  response_type = 'code'

const spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId
});

const authorizeURL = spotifyApi.createAuthorizeURL(scopes);

module.exports = {
    authorizeURL
}


