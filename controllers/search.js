const { ServerError } = require('../errorCodes')

const handleSearch = (req, res, db) => {
	const { searchKey } = req.body;
	const key = searchKey.toLowerCase();
	return db.select('*').from('entries')
		.whereRaw('LOWER(english_word) LIKE ?', `%${key}%`)		
		.orWhere('canto_word', 'LIKE', `%${key}%`)
		.orWhereRaw('LOWER(jyutping) LIKE ?', `%${key}%`)
		.orWhere('mandarin_word', 'LIKE', `%${key}%`)
		.orderByRaw('CHAR_LENGTH(english_word)')
		.then(entries => {
			res.json(entries)
		})
		.catch(err => res.status(400).json(new ServerError()))
}

const handleEntryID = (req, res, db) => {
	const { entryID } = req.body;
	return db.select('*').from('entries')
		.where('entry_id', '=', entryID)
		.then(entry => {
			res.json(entry[0])
		})
		.catch(err => res.status(400).json(new ServerError()))
}

const addRecent = (req, res, db) => {
	const { userID, entryID } = req.body;
	db.select('*').from('recents')
		.where('user_id', '=', userID)
		.andWhere('entry_id', '=', entryID)
		.then(recent => {
			if (recent.length) {
				return db('recents')
				.returning('*')
				.where('user_id', '=', userID)
				.andWhere('entry_id', '=', entryID)
				.update({
					date_viewed: new Date()
				})
				.then(recent => res.json(recent[0]))
				.catch(err => res.status(400).json(new ServerError()))
			} else {
				return db('recents')
				.returning('*')
				.insert({
					user_id: userID,
					entry_id: entryID,
					date_viewed: new Date()
				})
				.then(recent => res.json(recent[0]))
				.catch(err => res.status(400).json(new ServerError()))
			}
		})
		.catch(err => res.status(400).json(new ServerError()))
}

const getRecent = (req, res, db) => {
	const { userID } = req.body;
	db.select('*').from('entries')
		.innerJoin('recents', 'entries.entry_id', 'recents.entry_id')
		.where('recents.user_id', '=', userID)
		.orderBy('date_viewed', 'desc')
		.then(entries => {
			res.json(entries);
		})
		.catch(err => res.status(400).json(new ServerError()))

}

module.exports = {
	handleSearch,
	handleEntryID,
	addRecent,
	getRecent
}