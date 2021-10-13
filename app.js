const { request } = require('express');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cors = require('cors')

// retrieving objects from auth.js
const auth = require('./auth')

const app = express();

app.engine('handlebars', exphbs({
    //set default path for views
    layoutsDir: path.join(__dirname, '/views/layouts '),
}));
   
app.set('view engine', 'handlebars');
app.set('views',path.join(__dirname,'views'))

app.use(express.static('public'))
.use(cors());

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    authURL = auth.authorizeURL
    res.redirect(authURL)
})

app.get('/callback', (req, res) => {
    const code = req.query.code || null
    console.log(code)
    res.render('home')
})

// set PORT to process.env.PORT (for Heroku) or 3000
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("\n Server listening on port " + PORT + "\n")
});
