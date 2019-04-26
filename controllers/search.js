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

const handleEntryID = (req, res, db) => {
	const { entryID } = req.body;
	return db.select('*').from('entries')
		.where('entryID', '=', entryID)
		.then(entry => {
			res.json(entry[0])
		})
		.catch(err => res.status(400).json('Unable to retrieve entry'))
}

const addRecent = (req, res, db) => {
	const { userID, entryID } = req.body;
	db.select('*').from('recent')
		.where('user_id', '=', userID)
		.andWhere('entry_id', '=', entryID)
		.then(recent => {
			if (recent.length) {
				return db('recent')
				.returning('*')
				.where('user_id', '=', userID)
				.andWhere('entry_id', '=', entryID)
				.update({
					date_viewed: new Date()
				})
				.then(recent => res.json(recent[0]))
				.catch(err => res.status(400).json('Unable to update recently viewed.'))
			} else {
				return db('recent')
				.returning('*')
				.insert({
					user_id: userID,
					entry_id: entryID,
					date_viewed: new Date()
				})
				.then(recent => res.json(recent[0]))
				.catch(err => res.status(400).json('Unable to add to recently viewed.'))
			}
		})
		.catch(err => res.status(400).json('Unable to add to recently viewed.'))
}

const getRecent = (req, res, db) => {
	const { userID } = req.body;
	db.select('*').from('entries')
		.innerJoin('recent', 'entries.entryID', 'recent.entry_id')
		.where('recent.user_id', '=', userID)
		.orderBy('date_viewed', 'desc')
		.then(entries => {
			res.json(entries);
		})
		.catch(err => res.status(400).json('Unable to retrieve recently viewed'))

}

module.exports = {
	handleSearch,
	handleEntryID,
	addRecent,
	getRecent
}