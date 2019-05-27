const getWordOfDay = (res, db) => {
	db.select('*').from('word_of_day')
		.then(data => {
			res.json(data)
		})
		.catch(err => {
			const error = err.isCustom ? err : new ServerError()
			res.status(400).json(error)
		})
}

module.exports = {
	getWordOfDay,
}