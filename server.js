const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const schdule = require('node-schedule');
const https = require('https');
const schedule = require('node-schedule');
require('dotenv').config();

const { SERVERURL, URL } = require('./helpers/constants');
setInterval(function() {
    https.get(SERVERURL);
    https.get(URL);
}, 300000);

const wodScheduler = schedule.scheduleJob('20 * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
});

const middleware = require('./middleware');
const favorites = require('./controllers/favorites');
const login = require('./controllers/login');
const search = require('./controllers/search');
const contact = require('./controllers/contact');
const wordOfTheDay = require('./controllers/wordOfTheDay');
const stream = require('./controllers/stream');

const { configureDB } = require('./helpers/utils');
const db = configureDB()

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', middleware.checkToken, (req, res) => { res.json(req.decoded.user)});

app.post('/contact-us', (req, res) => { contact.handleContact(req, res, db) })

app.post('/search', (req, res) => { search.handleSearch(req, res, db) })

app.post('/entryid', (req, res) => { search.handleEntryID(req, res, db) })

app.post('/stream-audio', (req, res) => { stream.handleStream(req, res) })

app.post('/recent/add', middleware.checkToken, (req, res) => { search.addRecent(req, res, db) })

app.post('/search/recent', middleware.checkToken, (req, res) => { search.getRecent(req, res, db) })

app.post('/signin', (req, res) => { login.handleSignIn(req, res, db, bcrypt) })

app.post('/register', (req, res) => { login.handleRegister(req, res, db) })

app.post('/register/complete', (req, res) => { login.completeRegistration(req, res, db, bcrypt) })

app.post('/api/v1/auth/facebook', (req, res) => { login.handleFB(req, res, db) })

app.post('/delete-account', middleware.checkToken, (req, res) => { login.deleteAccount(req, res, db, bcrypt) })

app.post('/favorites/toggle', middleware.checkToken, (req, res) => { favorites.toggleFavorite(req, res, db) })

app.post('/favorites/isFavorited', middleware.checkToken, (req, res) => { favorites.checkIfFavorited(req, res, db)})

app.post('/search/favorites', middleware.checkToken, (req, res) => { favorites.getFavorites(req, res, db) })

app.get('/word-of-the-day', (req, res) => { wordOfTheDay.getWordOfDay(res, db)})

app.get('/learn', (req, res) => {
	const {id} = req.params;
})

app.listen(process.env.PORT || 3000, () => {
	console.log(`app is running on port ${process.env.PORT}`);
});