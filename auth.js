const env = require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node'); //3rd party Spotify npm package
const https = require('https');
const app = require('./app');
const { response } = require('express');

// scopes for API
const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ]

//variables for auth
const redirectUri = 'https://lyrical-visual.herokuapp.com/callback'
const clientId = String(process.env.CLIENT_ID)
const clientSecret = String(process.env.CLIENT_SECRET)

const spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret
});

const authorizeURL = spotifyApi.createAuthorizeURL(scopes);

function setAccessToken(access_token) {
    spotifyApi.setAccessToken(access_token);
    spotifyApi.authorizationCodeGrant(access_token).then(response => {
        console.log(response);
    })
};

function refreshAccessToken() {
    spotifyApi.refreshAccessToken().then(
        function(data) {
            console.log('The access token has been refreshed!');
        
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
        },
        function(err) {
            console.log('Could not refresh access token', err);
        }
    )
}

module.exports = {
    authorizeURL,
    setAccessToken,
    refreshAccessToken,
    spotifyApi
}


