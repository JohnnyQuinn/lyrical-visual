const { request } = require('express');
const express = require('express');
const exphbs = require('express-handlebars');
const env = require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node'); //3rd party Spotify npm package
const path = require('path');
const cors = require('cors')


// --- SERVER SET UP ---
const app = express();

// set PORT to process.env.PORT (for Heroku) or 3000
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("\n Server listening on port " + PORT + "\n")
});

// --- FRONTEND TEMPLATING SET UP ---
const hbs = exphbs.create({
  layoutsDir: path.join(__dirname, '/views/layouts ')
})
   
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars');

app.use(express.static('public'))
.use(cors());

// --- BASIC ROUTES ---

// HOMEPAGE
app.get('/', (req, res) => {
    if(spotifyApi === undefined){
      console.log(`\n spotifyApi.getAccessToken is undefined \n`)
    }
    else {
      console.log(`\nspotifyAPI.getAccessToken: ${spotifyApi.getAccessToken()}\n`)
    }
    res.render('home');
});

// LOGIN
app.get('/login', (req, res) => {
    res.redirect(authorizeURL)
})

// PLAYER  
app.get('/player', (req, res, next) => {
  const access_token = () => String(spotifyApi.getAccessToken())
  console.log(access_token)
  res.render('player', {access_token: access_token()});
})

// --- AUTHENTICATION ---
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

// VARIABLES FOR AUTH
const redirectUri = 'https://lyrical-visual.herokuapp.com/callback'
const clientId = String(process.env.CLIENT_ID)
const clientSecret = String(process.env.CLIENT_SECRET)

const spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: clientSecret
});

const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
console.log(`\n --- Authentication URL --- \n${authorizeURL}\n --- Authentication URL --- `);

// CALLBACK 
app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;
  
    if (error) {
      console.error('Callback Error:', error);
      res.send(`Callback Error: ${error}`);
      return;
    }
  
    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
  
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
  
        console.log('\naccess_token:', access_token);
        console.log('\nrefresh_token:', refresh_token);
  
        console.log(
          `\nSucessfully retreived access token. Expires in ${expires_in} s.`
        );
        // res.send('Success! You can now close the window.');
        res.redirect('/')
  
        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];
  
          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token);
          spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
      })
      .catch(error => {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
      });
});

// REFRESH
app.get('/refresh', (req, res) => {
  spotifyApi.refreshAccessToken().then(
    function(data) {
      console.log('The access token has been refreshed!');
  
      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log('Could not refresh access token', err);
    }
  );
})

app.get('/getme', (req, res) => {
    (async () => {
        const me = await spotifyApi.getMe();
        console.log(me);
        res.render('home')
    })().catch(e => {
        console.error(e);
        res.render('home')
    });
})
