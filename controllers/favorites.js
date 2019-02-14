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
}

module.exports = {
	toggleFavorite
}