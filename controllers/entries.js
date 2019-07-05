const { EntryNotAdded, AdminOnly } = require('../errorCodes');

const addEntry = (req, res, db) => {
	const { 
		decoded,
		canto_word,
	    jyutping,
	    classifier,
	    english_word,
	    mandarin_word,
	    canto_sentence,
	    jyutping_sentence,
	    english_sentence
	} = req.body;

	if (decoded.userEmail === process.env.ADMIN_USER) {
		db('entries')
			.returning('*')
			.insert({
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
			.catch(() => res.status(400).json(new EntryNotAdded()))
		} else {
			res.status(400).json(new AdminOnly())
		}
}

module.exports = {
	addEntry
}