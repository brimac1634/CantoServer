function scheduledJob(db) {
	const date = new Date();
	const formattedDate = date.toISOString().split('T')[0];
	// Add new wod
	console.log(`adding word of the day for ${formattedDate}`)
	db.select('date').from('word_of_day')
		.where('date', '=', formattedDate)
		.then(data => {
			if (data[0]) {
				console.log('already added')
			} else {
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
							.then(wod => {
								console.log(`Added wod for ${wod[0].date}`)
							})
							.catch(console.log)
					})
					.catch(console.log)
			}
		})
		.catch(console.log('failed to add word of the day'))
  
	// clear old recents
	date.setMonth(date.getMonth() - 1);
	db.select('recent_id').from('recents')
		.where('date_viewed', '<', date)
		.then(oldRecents => {
			console.log(`Recents beyond one month removed: ${oldRecents}`)
			return db('recents')
				.returning('*')
				.where('date_viewed', '<', date)
				.del()
				.then(console.log('Remove recents - success'))
				.catch(console.log)
		})

	// clear word of the day
	date.setMonth(date.getMonth() - 6);
	db.select('*').from('word_of_day')
		.where('date', '<', date)
		.then(oldWODS => {
			console.log(`WODS beyond 6 months removed: ${oldWODS}`)
			return db('word_of_day')
				.returning('*')
				.where('date', '<', date)
				.del()
				.then(console.log('Remove wods - success'))
				.catch(console.log)
		})
}

module.exports = {
	scheduledJob
}