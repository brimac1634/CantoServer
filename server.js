const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const favorites = require('./controllers/favorites');
const login = require('./controllers/login');
const search = require('./controllers/search');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'brianmacpherson',
    password : '',
    database : 'cantotalk'
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


app.listen(3000, () => {
	console.log('app is running on port 3000');
});