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

app.post('/', (req, res) => { search.handleSearch(req, res, db) })

app.post('/recent/add', (req, res) => { search.addRecent(req, res, db) })

app.post('/recent', (req, res) => { search.getRecent(req, res, db) })

app.post('/signin', (req, res) => { login.handleSignIn(req, res, db, bcrypt) })

app.post('/register', (req, res) => { login.handleRegister(req, res, db, bcrypt) })

app.post('/Favorites/toggle', (req, res) => { favorites.toggleFavorite(req, res, db) })

app.post('/Favorites/isFavorited', (req, res) => { favorites.checkIfFavorited(req, res, db)})

app.post('/Favorites', (req, res) => { favorites.getFavorites(req, res, db) })

app.get('/WordOfTheDay', (req, res) => {

})

app.get('/Learn', (req, res) => {
	const {id} = req.params;

})


app.listen(3000, () => {
	console.log('app is running on port 3000');
});