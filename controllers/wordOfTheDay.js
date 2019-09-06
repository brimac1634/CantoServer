const getWordOfDay = (res, db) => {
	db.select('entry_id', 'date').from('word_of_day')
	db.select('*').from('entries')
		.rightJoin('word_of_day', 'entries.entry_id', 'word_of_day.entry_id')
		.orderBy('date', 'desc')
		.then(data => {
			res.json(data)
		})
		.catch(err => {
			const error = err.isCustom ? err : new ServerError()
			res.json(error)
		})
}

module.exports = {
	getWordOfDay,
}