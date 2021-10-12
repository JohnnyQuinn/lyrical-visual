const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();
const PORT = '3000';

app.engine('handlebars', exphbs({
    layoutsDir: path.join(__dirname, '/views/layouts '),
}));
   
app.set('view engine', 'handlebars');
app.set('views',path.join(__dirname,'views'))

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(PORT, () => {
    console.log("\n Server listening on port " + PORT + "\n")
});
