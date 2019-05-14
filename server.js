const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
var mailgun = require('mailgun-js')
var api_key = process.env.MG_API_KEY;
var DOMAIN = 'mg.cantotalk.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

const favorites = require('./controllers/favorites');
const login = require('./controllers/login');
const search = require('./controllers/search');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/search', (req, res) => { search.handleSearch(req, res, db) })

app.post('/entryid', (req, res) => { search.handleEntryID(req, res, db) })

app.post('/recent/add', (req, res) => { search.addRecent(req, res, db) })

app.post('/search/recent', (req, res) => { search.getRecent(req, res, db) })

app.post('/signin', (req, res) => { login.handleSignIn(req, res, db, bcrypt) })

app.post('/register', (req, res) => { login.handleRegister(req, res, db, bcrypt) })

app.post('/favorites/toggle', (req, res) => { favorites.toggleFavorite(req, res, db) })

app.post('/favorites/isFavorited', (req, res) => { favorites.checkIfFavorited(req, res, db)})

app.post('/search/favorites', (req, res) => { favorites.getFavorites(req, res, db) })

app.get('/wordOfTheDay', (req, res) => {

})

app.get('/learn', (req, res) => {
	const {id} = req.params;
})

const data = {
	from: 'info@cantotalk.com',
	to: 'brimac1634@gmail.com',
	subject: 'Hello',
	text: 'Testing some Mailgun awesomness!'
};
mailgun.messages().send(data, function (error, body) {
	console.log(body);
});


app.listen(process.env.PORT || 3000, () => {
	console.log(`app is running on port ${process.env.PORT}`);
});