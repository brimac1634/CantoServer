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
	return db.select('*').from('entries')
		.where('englishword', 'LIKE', `%${searchKey}%`)		
		.orWhere('cantoword', 'LIKE', `%${searchKey}%`)
		.orWhere('jyutping', 'LIKE', `%${searchKey}%`)
		.orWhere('mandarinword', 'LIKE', `%${searchKey}%`)
		.orderByRaw('CHAR_LENGTH(englishword)')
		.then(entries => {
			res.json(entries)
		})
		.catch(err => res.status(400).json('Unable to retrieve entries'))
})

app.post('/signin', (req, res) => { login.handleSignIn(req, res, db, bcrypt) })

app.post('/register', (req, res) => { login.handleRegister(req, res, db, bcrypt) })

app.post('/Favorites/toggle', (req, res) => { favorites.toggleFavorite(req, res, db) })

app.post('/Favorites', (req, res) => { favorites.getFavorites(req, res, db) })

app.get('/WordOfTheDay', (req, res) => {

})

app.get('/Learn', (req, res) => {
	const {id} = req.params;

})


/*
/ -> this is working/ db
/signin -> post success/fail
/register -> post user
/Favorites -> get favorites db
*/

app.listen(3000, () => {
	console.log('app is running on port 3000');
});