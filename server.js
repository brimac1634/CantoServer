const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const mc = require('mailcomposer');
require('dotenv').config();

const favorites = require('./controllers/favorites');
const login = require('./controllers/login');
const search = require('./controllers/search');
const contact = require('./controllers/contact');

let db = ''
if (process.env.PORT == 3000) {
	db = knex({
	  client: 'pg',
	  connection: {
	    host : '127.0.0.1',
	    user : 'brianmacpherson',
	    password : '',
	    database : 'cantotalk'
	  }
	});
} else {
	db = knex({
	  client: 'pg',
	  connection: {
	    connectionString: process.env.DATABASE_URL,
	    ssl: true,
	  }
	});
}


const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/contact-us', (req, res) => { contact.handleContact(req, res, db, mc) })

app.post('/search', (req, res) => { search.handleSearch(req, res, db) })

app.post('/entryid', (req, res) => { search.handleEntryID(req, res, db) })

app.post('/recent/add', (req, res) => { search.addRecent(req, res, db) })

app.post('/search/recent', (req, res) => { search.getRecent(req, res, db) })

app.post('/signin', (req, res) => { login.handleSignIn(req, res, db, bcrypt) })

app.post('/register', (req, res) => { login.handleRegister(req, res, db) })

app.post('/register/complete', (req, res) => { login.completeRegistration(req, res, db, bcrypt) })

app.post('/favorites/toggle', (req, res) => { favorites.toggleFavorite(req, res, db) })

app.post('/favorites/isFavorited', (req, res) => { favorites.checkIfFavorited(req, res, db)})

app.post('/search/favorites', (req, res) => { favorites.getFavorites(req, res, db) })

app.get('/wordOfTheDay', (req, res) => {

})

app.get('/learn', (req, res) => {
	const {id} = req.params;
})


app.listen(process.env.PORT || 3000, () => {
	console.log(`app is running on port ${process.env.PORT}`);
});