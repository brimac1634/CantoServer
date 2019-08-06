const { 
	ServerError, 
	NoDeckFound, 
	EntryNotAdded, 
	UserNotFound,
	ProgressNotUpdated 
} = require('../errorCodes')

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
		.leftJoin('users', 'users.id', 'decks.user_id')
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
	let { deck_id, deck_name, user_id, is_public, is_official, tags, entry_ids, description } = req.body;
	deck_name = deck_name.toLowerCase();
	tags = tags.toLowerCase();
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
							user_id: is_official ? 0 : user_id,
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
	const { deck_id, user_id } = req.body;

	const getDeckEntriesNoUser = () => {
		db.select('*').from('entries')
			.innerJoin('deck_entries', 'deck_entries.entry_id', 'entries.entry_id')
			.where('deck_entries.deck_id', deck_id)
			.then(entries => {
				res.json(entries)
			})
			.catch(() => res.status(400).json(new ServerError()))
	}

	if (user_id) {
		db.select('*').from('users')
			.where('id', user_id)
			.then(data =>{
				if (data[0]){
					return db.select(
							'e.*',
							'de.deck_id',
							db.raw('gt.progress, CASE WHEN gt.progress IS NULL THEN 0 ELSE gt.progress END'),
							'gt.user_id'
						)
						.from('entries AS e')
						.innerJoin('deck_entries AS de', 'de.entry_id', 'e.entry_id')
						.leftJoin('game_trackers AS gt', 'gt.entry_id', 'de.entry_id')
						.where('de.deck_id', deck_id)
						.andWhere(function(){
							this.where('gt.user_id', user_id).orWhere('gt.user_id', null)
						})
						.orderByRaw('CASE WHEN gt.progress > 0 THEN 0 ELSE 1 END, gt.progress DESC')
						.then(entries => {
							res.json(entries)
						})
						.catch(err => {
							console.log(err)
							res.status(400).json(new ServerError())
						})
				} else {
					return getDeckEntriesNoUser()
				}
			})
			.catch(err => {
				console.log(err)
				const error = err.isCustom ? err : new ServerError()
				res.status(400).json(error)
			})
	} else {
		getDeckEntriesNoUser()
	}
}

const updateProgress = (req, res, db) => {
	const { user_id, entries } = req.body;
	db.select('id').from('users')
		.where('id', user_id)
		.then(data => {
			if (data[0]) {
				return Promise.all(entries.map(entry => {
					let { entry_id, progress } = entry;
					return db.select('*').from('game_trackers')
						.where('user_id', data[0].id)
						.andWhere('entry_id', entry_id)
						.then(tracker => {
							if (tracker[0]) {
								const { tracker_id } = tracker[0];
								progress += tracker[0].progress;
								return db.select('*').from('game_trackers')
									.where('tracker_id', tracker_id)
									.update({ progress })
									.catch(()=>{
										throw new ProgressNotUpdated()
									})
							} else {
								return db('game_trackers')
									.insert({
										user_id,
										entry_id,
										progress
									})
									.catch(()=>{
										throw new ProgressNotUpdated()
									})
							}
						})
						.catch(()=>{
							throw new ProgressNotUpdated()
						})
				}))
			} else {
				throw new UserNotFound()
			}
		})
		.then(() => res.json('Progress Successfully Updated'))
		.catch(err => {
			console.log(err)
			const error = err.isCustom ? err : new ServerError()
			res.status(400).json(error)
		})
}

const deleteDeck = (req, res, db) => {
	const { deck_id } = req.body;
	db.select('*').from('decks')
		.where('deck_id', deck_id)
		.then(deck => {
			if (deck[0]) {
				db.transaction(trx => {
					return trx.select('*').from('decks')
					.where('deck_id', deck_id)
					.returning('deck_id')
					.del()
					.then(deckID => {
						return trx.select('*').from('deck_entries')
						.where('deck_id', deckID[0])
						.returning('deck_id')
						.del()
						.then(deckID => {
							console.log(`deck deleted: ${deckID[0]}`)
							res.json('deck deleted')
						})
						.catch(() => {
							res.status(400).json(new ServerError())
						})
					})
					.then(trx.commit)
					.catch(trx.rollback)
				})
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
	getDeckByID,
	searchDecks,
	newDeck,
	getDeckEntries,
	updateProgress,
	deleteDeck
}