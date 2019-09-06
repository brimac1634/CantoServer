const { ServerError } = require('../errorCodes')

const toggleFavorite = (req, res, db) => {
	const { userID, entryID, cantoWord } = req.body;
	db.select('*').from('favorites')
		.where('user_id', '=', userID)
		.andWhere('entry_id', '=', entryID)
		.then(data => {
			if (data.length) {
				return db('favorites')
				.returning('*')
				.where('user_id', '=', userID)
				.andWhere('entry_id', '=', entryID)
				.del()
				.then(data => res.json(false))
				.catch(() => res.json(new ServerError()))
			} else {
				return db('favorites')
				.returning('*')
				.insert({
					user_id: userID,
					entry_id: entryID,
					canto_word: cantoWord,
					date_favorited: new Date()
				})
				.then(favorite => res.json(true))
				.catch(() => res.json(new ServerError()))
			}
		})
		.catch(() => res.json(new ServerError()))
}

const checkIfFavorited = (req, res, db) => {
	const { userID, entryID } = req.body;
	db.select('favorite_id').from('favorites')
		.where('entry_id', '=', entryID)
		.andWhere('user_id', '=', userID)
		.then(data => {
			if (data.length) {
				res.json(true);
			} else {
				res.json(false)
			}
		})
		.catch(() => res.json(new ServerError()))
}

const getFavorites = (req, res, db) => {
	const {userID} = req.body;
	db.select('*').from('entries')
		.innerJoin('favorites', 'entries.entry_id', 'favorites.entry_id')
		.where('favorites.user_id', '=', userID)
		.orderBy('date_favorited', 'desc')
		.then(entries => {
			res.json(entries)
		})
		.catch(() => res.json(new ServerError()))
}

module.exports = {
	toggleFavorite,
	checkIfFavorited,
	getFavorites
}