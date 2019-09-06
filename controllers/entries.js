const { EntryNotAdded, AdminOnly, ServerError } = require('../errorCodes');

const addEntry = (req, res, db) => {
	const { userEmail } = req.decoded.user;
	const { 
		canto_word,
	    jyutping,
	    classifier,
	    english_word,
	    mandarin_word,
	    canto_sentence,
	    jyutping_sentence,
	    english_sentence
	} = req.body;

	if (userEmail === process.env.ADMIN_USER) {
		db('entries').count('entry_id')
			.then(data => {
				const newEntryID = Number(data[0].count) + 1;
				return db('entries')
					.returning('*')
					.insert({
						entry_id: newEntryID,
						canto_word,
					    jyutping,
					    classifier,
					    english_word,
					    mandarin_word,
					    canto_sentence,
					    jyutping_sentence,
					    english_sentence 
					})
					.then(entry => res.json(entry[0]))
					.catch(()=>res.json(new EntryNotAdded()))
			})
			.catch(()=>res.json(new ServerError()))
	} else {
		res.json(new AdminOnly())
	}
}

module.exports = {
	addEntry
}