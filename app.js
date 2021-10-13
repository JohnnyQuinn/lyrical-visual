const { request } = require('express');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cors = require('cors')

// retrieving objects from auth.js
const auth = require('./auth')
const spotifyApi = auth.spotifyApi

const app = express();

app.engine('handlebars', exphbs({
    //set default path for views
    layoutsDir: path.join(__dirname, '/views/layouts '),
}));
   
app.set('view engine', 'handlebars');
app.set('views',path.join(__dirname,'views'))

app.use(express.static('public'))
.use(cors());

// --- ROUTES ---

// HOMEPAGE
app.get('/', (req, res) => {
    res.render('home');
});

// LOGIN
app.get('/login', (req, res) => {
    authURL = auth.authorizeURL
    res.redirect(authURL)
})

// CALLBACK
// app.get('/callback', (req, res) => {
//     const access_token = req.query.code || null;
//     console.log('\nAccess token: ' + access_token + '\n ');
//     res.render('home');
//     auth.setAccessToken(access_token)
// })

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
  
        console.log('access_token:', access_token);
        console.log('refresh_token:', refresh_token);
  
        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`
        );
        res.send('Success! You can now close the window.');
  
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
    auth.refreshAccessToken();
    res.render('home');
})

app.get('/getme', (req, res) => {

    (async () => {
        const me = await spotifyApi.getMe();
        console.log(me);
    })().catch(e => {
        console.error(e);
    });
    res.render('home')
})

// set PORT to process.env.PORT (for Heroku) or 3000
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("\n Server listening on port " + PORT + "\n")
});
