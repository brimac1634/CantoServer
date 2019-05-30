const { configureDB } = require('../helpers/utils');

const db = configureDB()

function addWordOfDay() {
    db('entries').count('entry_id')
		.then(data => {
			const totalEntries = data[0].count;
			const entryID = Math.floor(Math.random() * totalEntries) + 1
			return db('word_of_day')
				.returning('*')
				.insert({
					entry_id: entryID,
					date: new Date()
				})
				.then(console.log)
				.catch(console.log)
		})
		.catch(console.log)
}
addWordOfDay();

function clearRecents() {
	const date = new Date();
	date.setMonth(date.getMonth() - 1);
	db.select('recent_id').from('recents')
		.where('date_viewed', '<', date)
		.then(oldRecents => {
			console.log(`Recents beyond one month removed: ${oldRecents}`)
			return db('recents')
				.returning('*')
				.where('date_viewed', '<', date)
				.del()
				.then(console.log)
				.catch(console.log)
		})
}
clearRecents()

function clearWordsOfDay() {
	const date = new Date();
	date.setMonth(date.getMonth() - 6);
	db.select('*').from('word_of_day')
		.where('date', '<', date)
		.then(oldWODS => {
			console.log(`WODS beyond 6 months removed: ${oldWODS}`)
			return db('word_of_day')
				.returning('*')
				.where('date', '<', date)
				.del()
				.then(console.log)
				.catch(console.log)
		})
}
clearWordsOfDay()