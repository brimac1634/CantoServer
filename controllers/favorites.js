const { ServerError } = require('../errorCodes')

const toggleFavorite = (req, res, db) => {
	const { userID, entryID, cantoWord } = req.body;
	db.select('*').from('favorites')
		.where('userid', '=', userID)
		.andWhere('entryid', '=', entryID)
		.then(data => {
			if (data.length) {
				return db('favorites')
				.returning('*')
				.where('userid', '=', userID)
				.andWhere('entryid', '=', entryID)
				.del()
				.then(data => res.json(false))
				.catch(() => res.status(400).json(new ServerError()))
			} else {
				return db('favorites')
				.returning('*')
				.insert({
					userid: userID,
					entryid: entryID,
					cantoword: cantoWord,
					datefavorited: new Date()
				})
				.then(favorite => res.json(true))
				.catch(() => res.status(400).json(new ServerError()))
			}
		})
		.catch(() => res.status(400).json(new ServerError()))
}

const checkIfFavorited = (req, res, db) => {
	const { userID, entryID } = req.body;
	db.select('favoriteid').from('favorites')
		.where('entryid', '=', entryID)
		.andWhere('userid', '=', userID)
		.then(data => {
			if (data.length) {
				res.json(true);
			} else {
				res.json(false)
			}
		})
		.catch(() => res.status(400).json(new ServerError()))
}

const getFavorites = (req, res, db) => {
	const {id} = req.body;
	db.select('*').from('entries')
		.innerJoin('favorites', 'entries.entryID', 'favorites.entryid')
		.where('favorites.userid', '=', id)
		.orderBy('datefavorited', 'desc')
		.then(entries => {
			res.json(entries)
		})
		.catch(() => res.status(400).json(new ServerError()))
}

module.exports = {
	toggleFavorite,
	checkIfFavorited,
	getFavorites
}