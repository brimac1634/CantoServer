const toggleFavorite = (req, res, db) => {
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
				.then(data => res.json(false))
				.catch(err => res.status(400).json('Unable to remove favorite'))
			} else {
				return db('favorites')
				.returning('*')
				.insert({
					userid: userid,
					entryid: entryid,
					cantoword: cantoword,
					datefavorited: new Date()
				})
				.then(favorite => res.json(true))
				.catch(err => res.status(400).json('Unable to save favorite'))
			}
		})
		.catch(err => res.status(400).json(err))
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
		.catch(err => res.status(400).json('Unable to check if favorite'))
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
		.catch(err => res.status(400).json('Unable to retrieve favorites'))
}

module.exports = {
	toggleFavorite,
	checkIfFavorited,
	getFavorites
}