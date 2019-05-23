const api_key = process.env.MG_API_KEY;
const DOMAIN = process.env.MG_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
const { ServerError, EmailError } = require('../errorCodes')
const { validateEmail, sendMail } = require('../helpers/utils');

const handleContact = (req, res, db, mc) => {
	const { name, email, message } = req.body;
	if (validateEmail(email) && name && message) {
		sendMail({
			name: name,
			fromEmail: email,
			toEmail: 'info@cantotalk.com',
			subject: 'CantoTalk - Contact Us',
			message: message,
			ifSuccess: ()=>{
				db('messages')
					.returning('*')
					.insert({
						name: name,
						email: email,
						date_sent: new Date()
					})
					.then(message => res.json(message))
					.catch(() => res.status(400).json(new ServerError()))
			},
			ifError: ()=>{
				res.status(400).json(new EmailError())
			}
		})
	}
}


module.exports = {
	handleContact,
}