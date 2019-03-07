const handleSearch = (req, res, db) => {
	const { searchKey } = req.body;
	const key = searchKey.toLowerCase();
	return db.select('*').from('entries')
		.whereRaw('LOWER(englishword) LIKE ?', `%${key}%`)		
		.orWhere('cantoword', 'LIKE', `%${key}%`)
		.orWhereRaw('LOWER(jyutping) LIKE ?', `%${key}%`)
		.orWhere('mandarinword', 'LIKE', `%${key}%`)
		.orderByRaw('CHAR_LENGTH(englishword)')
		.then(entries => {
			res.json(entries)
		})
		.catch(err => res.status(400).json('Unable to retrieve entries'))
}

const addRecent = (req, res, db) => {
	const { userID, entryID } = req.body;
	db('recent')
		.returning('*')
		.insert({
			user_id: userID,
			entry_id: entryID,
			date_viewed: new Date()
		})
		.then(recent => res.json(recent[0]))
		.catch(err => res.status(400).json('Unable to add to recently viewed.'))
}

const getRecent = (req, res, db) => {
	const { userID } = req.body;

}

module.exports = {
	handleSearch,
	addRecent,
	getRecent
}