const api_key = process.env.MG_API_KEY;
const DOMAIN = process.env.MG_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
const { ServerError } = require('../errorCodes')
const { validateEmail } = require('../utils');

const handleContact = (req, res, db) => {
	const { name, email, message } = req.body;
	if (validateEmail(email) && name && message) {
		const data = {
		  from: `${name} <${email}>`,
		  to: 'info@cantotalk.com, brimac1634@gmail.com',
		  subject: 'CantoTalk Contact Us',
		  text: `${message}`
		};

		mailgun.messages().send(data, (error, body) => {
		  console.log(body);
		});
	}
	
	// db('favorites')
	// 	.returning('*')
	// 	.insert({
	// 		user_id: userID,
	// 		entry_id: entryID,
	// 		canto_word: cantoWord,
	// 		date_favorited: new Date()
	// 	})
	// 	.then(favorite => res.json(true))
	// 	.catch(() => res.status(400).json(new ServerError()))
}


module.exports = {
	handleContact,
}