const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const favorites = require('./controllers/favorites');
const login = require('./controllers/login');

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

app.post('/', (req, res) => {
	const { searchKey } = req.body;
	const key = searchKey.toLowerCase();
	return db.select('*').from('entries')
		.whereRaw('LOWER(englishword) LIKE ?', `%${key}%`)		
		.orWhere('cantoword', 'LIKE', `%${key}%`)
		.orWhereRaw('LOWER(jyutping) LIKE ?', `%${key}%`)
		.orWhere('mandarinword', 'LIKE', `%${key}%`)
		.orderByRaw('CHAR_LENGTH(englishword)')
		.then(entries => {
			res.json(entries)
		})
		.catch(err => res.status(400).json('Unable to retrieve entries'))
})

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