const { ServerError } = require('../errorCodes')

const handleSearch = (req, res, db) => {
	const { searchKey, searchType } = req.body;
	const key = searchKey.toLowerCase();
	let query;
	let column;

	function runQuery() {
		return db.select('*').from('entries')
			.whereRaw(query, `%${key}%`)
			.orderByRaw(`CHAR_LENGTH(${column})`)
			.then(entries => {
				res.json(entries)
			})
			.catch(err => res.json(new ServerError()))
	}

	switch (searchType) {
		case 'Can':
			column = 'canto_word';
			query = 'canto_word LIKE ?';
			runQuery(); 
			break;
		case 'Eng':
			column = 'english_word';
			query = 'LOWER(english_word) LIKE ?'; 
			runQuery();
			break;
		case 'Man':
			column = 'mandarin_word';
			query = 'mandarin_word LIKE ?';
			runQuery();
			break;
		case 'Jyu':
			column = 'jyutping';
			query = 'LOWER(jyutping) LIKE ?';
			runQuery();
			break; 
		default:
			return db.select('*').from('entries')
				.whereRaw('LOWER(english_word) LIKE ?', `%${key}%`)		
				.orWhere('canto_word', 'LIKE', `%${key}%`)
				.orWhereRaw('LOWER(jyutping) LIKE ?', `%${key}%`)
				.orWhere('mandarin_word', 'LIKE', `%${key}%`)
				.orderByRaw('CHAR_LENGTH(english_word)')
				.then(entries => {
					res.json(entries)
				})
				.catch(err => res.json(new ServerError()))
	}
}

const handleEntryID = (req, res, db) => {
	const { entryID } = req.body;
	return db.select('*').from('entries')
		.where('entry_id', '=', entryID)
		.then(entry => {
			res.json(entry[0])
		})
		.catch(err => res.json(new ServerError()))
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
				.catch(err => res.json(new ServerError()))
			} else {
				return db('recents')
				.returning('*')
				.insert({
					user_id: userID,
					entry_id: entryID,
					date_viewed: new Date()
				})
				.then(recent => res.json(recent[0]))
				.catch(err => res.json(new ServerError()))
			}
		})
		.catch(err => res.json(new ServerError()))
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
		.catch(err => res.json(new ServerError()))

}

module.exports = {
	handleSearch,
	handleEntryID,
	addRecent,
	getRecent
}