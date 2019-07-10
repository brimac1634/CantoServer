const { ServerError, NoDeckFound, EntryNotAdded } = require('../errorCodes')

const getDecks = (req, res, db) => {
	const { userID } = req.body;
	db.select('*').from('decks')
		.where('user_id', userID ? userID : null)
		.orWhere('user_id', 0)
		.orWhere(function() {
			this.where('public', '1').orderBy('users', 'desc').limit(10)
		})
		.then(data => {
			res.json(data)
		})
		.catch(err => {
			console.log(err)
			res.status(400).json(new ServerError())
		})
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
		.orderBy('users', 'desc')
		.then(data => {
			res.json(data)
		})
		.catch(() => res.status(400).json(new ServerError()))
}

const newDeck = (req, res, db) => {
	const { name, user_id, is_public, is_official, tags } = req.body;
	db('decks')
		.returning('*')
		.insert({
			name,
			user_id: is_official ? 0 : user_id,
			is_public: is_official ? '1' : is_public,
			tags,
			date_created: new Date(),
			users: is_official ? 100000 : 1 
		})
		.then(deck => res.json(deck[0]))
		.catch(err=>{
			console.log(err)
			res.status(400).json(new ServerError())
		})
}

const addToDeck = (req, res, db) => {
	const { deck_id, entry_ids } = req.body;
	db.select('deck_id').from('decks')
		.where('deck_id', deck_id)
		.then(deck => {
			if (deck[0]) {
				entry_ids.forEach(entry_id => {
					return db('deck_entries')
					.returning('*')
					.insert({
						deck_id,
						entry_id,
					})
					.catch(err=>{
						console.log(err)
						res.status(400).json(new EntryNotAdded())
					})
				})
				console.log('done')
			} else {
				throw new NoDeckFound()
			}
		})
		.catch(err => {
			const error = err.isCustom ? err : new ServerError()
			res.status(400).json(error)
		})
}


module.exports = {
	getDecks,
	searchDecks,
	newDeck,
	addToDeck
}