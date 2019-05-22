const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const schdule = require('node-schedule');
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

app.post('/contact-us', (req, res) => { contact.handleContact(req, res, db) })

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

app.get('/word-of-the-day', (req, res) => {

})

app.get('/learn', (req, res) => {
	const {id} = req.params;
})

schdule.scheduleJob('0 0 * * *', ()=>{
	db('entries').count('entryID')
		.then(data => {
			const totalEntries = data[0].count;
			const entryID = Math.floor(Math.random() * totalEntries) + 1
			return db('word_of_day')
				.returning('*')
				.insert({
					entry_id: entryID,
					date: new Date()
				})
				.then(console.log)
				.catch(console.log)
		})
		.catch(console.log)
})

app.listen(process.env.PORT || 3000, () => {
	console.log(`app is running on port ${process.env.PORT}`);
});