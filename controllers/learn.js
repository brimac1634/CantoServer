const { ServerError } = require('../errorCodes')

const getDecks = (req, res, db) => {
	const { userID } = req.body;
	db.select('*').from('decks')
		.where('user_id', userID)
		.orWhere('user_id', 0)
		.then(data => {
			res.json(data)
		})
		.catch(() => res.status(400).json(new ServerError()))
}

const searchDecks = (req, res, db) => {
	const { userID, key } = req.body;
	const search = key.toLowerCase()
	db.select('*').from('decks')
		.where(function() {
			this.whereRaw('tags LIKE ?', `%${search}%`).orWhereRaw('name LIKE ?', `%${search}%`)
		})
		.andWhere(function() {
			this.where('user_id', 0).orWhere('user_id', userID ? userID : null).orWhere('public', '1')
		})
		.then(data => {
			res.json(data)
		})
		.catch(err => {
			console.log(err)
			res.status(400).json(new ServerError())
		})
}


module.exports = {
	getDecks,
	searchDecks,
}