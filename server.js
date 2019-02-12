const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

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

app.post('/signin', (req, res) => {
	const { email, password } = req.body;
	db.select('email', 'hash').from('login')
		.where('email', '=', email)
		.then(data => {
			const isValid = bcrypt.compareSync(password, data[0].hash)
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to retrieve user'))
			} else {
				res.status(400).json('wrong credentials')
			}
		})
		.catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
	const { email, password } = req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
			.returning('*')
			.insert({
				email: loginEmail[0],
				joined: new Date()
			})
			.then(user => res.json(user[0]))
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('Unable to register'))
})

app.post('/Favorites/toggle', (req,res) => {
	const { userid, entryid, cantoword } = req.body;
	db.select('*').from('favorites')
		.where('userid', '=', userid)
		.andWhere('entryid', '=', entryid)
		.then(data => {
			if (data.length) {
				return db('favorites')
				.returning('*')
				.where('userid', '=', userid)
				.andWhere('entryid', '=', entryid)
				.del()
				.then(data => res.json('deleted'))
				.catch(err => res.status(400).json('Unable to remove favorite'))
			} else {
				console.log('fav not found')
				return db('favorites')
				.returning('*')
				.insert({
					userid: userid,
					entryid: entryid,
					cantoword: cantoword,
					datefavorited: new Date()
				})
				.then(favorite => res.json(favorite[0]))
				.catch(err => res.status(400).json('Unable to save favorite'))
			}
		})
		.catch(err => res.status(400).json(err))
})

app.post('/Favorites', (req, res) => {
	const {id} = req.body;
	db.select('*').from('entries')
		.innerJoin('favorites', 'entries.entryID', 'favorites.entryid')
		.where('favorites.userid', '=', id)
		.orderBy('datefavorited')
		.then(entries => {
			res.json(entries)
		})
		.catch(err => res.status(400).json('Unable to retrieve favorites'))
})

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