const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
	entries: [
		{
			entryID: 34,
			cantoWord: '車',
			jyutping: 'ce1',
			classifier: '㗎',
			englishWord: 'car',
			mandarinWord: '车'
		},
		{
			entryID: 67,
			cantoWord: '蟲',
			jyutping: 'cung1',
			classifier: '',
			englishWord: 'bug',
			mandarinWord: '虫'
		},
		{
			entryID: 69,
			cantoWord: '頭',
			jyutping: 'tau4',
			classifier: '',
			englishWord: 'head',
			mandarinWord: '头'
		}
	]
}

app.get('/', (req, res) => {
	res.send(database.entries)
})

app.post('/signin', (req, res) => {

})

app.post('/register', (req, res) => {
	
})

app.get('/Favorites/:id', (req, res) => {
	const {id} = req.params;

})

app.get('/WordOfTheDay', (req, res) => {
	const {id} = req.params;

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