const express = require('express');
const exphbs = require('express-handlebars');
const env = require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node'); //3rd party Spotify npm package
const path = require('path');
const cors = require('cors');


// --- SERVER SET UP ---
const app = express();

app.use(cors())

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
  const access_token = () => String(spotifyApi.getAccessToken()) //current access token
  page = 'player' //handlebars page (used in res.render)

  // sets user_data = initial promise of current authenticated user's data 
  const user_data = spotifyApi.getMe()
  .then((data) => {
    console.log('Some information about the authenticated user', data.body);
    return data
  })

  // uses values' from user_data promise for rendering player page
  const displayUserInfo = async () => {
    try {
      const name = (await user_data).body.display_name
      display_name = () => name
      console.log(`\nUSER CONNECTED:\n${display_name()}\n`)
      res.render(page, {access_token: access_token(), display_name: display_name()});
    } catch {
      res.render(page, {access_token: access_token()})
    }
  }

  displayUserInfo()
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
        
        console.log(' --- TOKENS ---')
        console.log('access_token:', access_token);
        console.log('\nrefresh_token:', refresh_token);
  
        console.log(
          `\nSucessfully retreived access token. Expires in ${expires_in} s.`
        );
        console.log(' --- TOKENS ---')
        // res.send('Success! You can now close the window.');
        res.redirect('/player')
  
        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];
  
          console.log('The access token has been refreshed!\n');
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

async function getDisplayName() {
  spotifyApi.getMe()
  .then(function(data) {
    console.log('Some information about the authenticated user', data.body);
    return data
  }, function(err) {
    console.log('Something went wrong!', err);
  })
}
