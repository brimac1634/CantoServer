const { ServerError, NoDeckFound, EntryNotAdded } = require('../errorCodes')

const getDecks = (req, res, db) => {
	const { userID } = req.body;
	db.select('*').from('decks')
		.where('user_id', userID ? userID : null)
		.orWhere('user_id', 0)
		.orWhere(function() {
			this.where('is_public', '1').orderBy('users', 'desc').limit(10)
		})
		.then(data => {
			res.json(data)
		})
		.catch(err => {
			console.log(err)
			res.status(400).json(new ServerError())
		})
}

const getDeckByID = (req, res, db) => {
	const { deck_id } = req.body;
	db.select('*').from('decks')
		.innerJoin('users', 'users.id', 'decks.user_id')
		.where('decks.deck_id', deck_id)
		.then(data => {
			res.json(data[0])
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
			this.whereRaw('tags LIKE ?', `%${search}%`).orWhereRaw('deck_name LIKE ?', `%${search}%`)
		})
		.andWhere(function() {
			this.where('user_id', 0).orWhere('user_id', userID ? userID : null).orWhere('is_public', '1')
		})
		.orderBy('users', 'desc')
		.then(data => {
			res.json(data)
		})
		.catch(() => res.status(400).json(new ServerError()))
}

const newDeck = (req, res, db) => {
	const { deck_id, deck_name, user_id, is_public, is_official, tags, entry_ids, description } = req.body;
	if (deck_id) {
		//editing deck
		db.select('deck_id').from('decks')
			.where('deck_id', deck_id)
			.then(deck => {
				if (deck[0]) {
					db.transaction(trx => {
						trx('decks')
						.returning('*')
						.where('deck_id', deck_id)
						.update({
							deck_name,
							is_public: is_official ? '1' : is_public,
							tags,
							description,
						})
						.into('decks')
						.returning('deck_id')
						.then(deckID => {
							return trx.select('*').from('deck_entries')
							.where('deck_id', deckID[0])
							.returning('deck_id')
							.del()
							.then(deckID => {
								const deck_id = deckID[0];
								const data = entry_ids.map(entry_id => {
									return { deck_id, entry_id }
								})
								return trx('deck_entries')
								.returning('*')
								.insert(data)
								.then(()=>res.json('success'))
								.catch(()=>res.status(400).json(new EntryNotAdded()))
							})
						})
						.then(trx.commit)
						.catch(trx.rollback)
					})
					.catch(err => {
						console.log(err)
						const error = err.isCustom ? err : new ServerError()
						res.status(400).json(error)
					})
				} else {
					throw new NoDeckFound()
				}
			})
			.catch(err => {
				const error = err.isCustom ? err : new ServerError()
				res.status(400).json(error)
			})
	} else {
		//new deck
		db.transaction(trx => {
			trx.insert({
				deck_name,
				user_id: is_official ? 0 : user_id,
				is_public: is_official ? '1' : is_public,
				tags,
				description,
				date_created: new Date(),
				users: is_official ? 100000 : 1 
			})
			.into('decks')
			.returning('deck_id')
			.then(deckID => {
				const deck_id = deckID[0];
				const data = entry_ids.map(entry_id => {
					return { deck_id, entry_id }
				})
				return trx('deck_entries')
				.returning('*')
				.insert(data)
				.then(()=>res.json('success'))
				.catch(()=>res.status(400).json(new EntryNotAdded()))
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => {
			console.log(err)
			const error = err.isCustom ? err : new ServerError()
			res.status(400).json(error)
		})
	}
}

const getDeckEntries = (req, res, db) => {
	const { deck_id } = req.body;
	db.select('*').from('entries')
		.innerJoin('deck_entries', 'deck_entries.entry_id', 'entries.entry_id')
		.where('deck_entries.deck_id', deck_id)
		.then(entries => {
			res.json(entries)
		})
		.catch(() => res.status(400).json(new ServerError()))
}


module.exports = {
	getDecks,
	getDeckByID,
	searchDecks,
	newDeck,
	getDeckEntries
}