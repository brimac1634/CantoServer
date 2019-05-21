const api_key = process.env.MG_API_KEY;
const DOMAIN = process.env.MG_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
const { ServerError, EmailError } = require('../errorCodes')
const { validateEmail } = require('../helpers/utils');

const handleContact = (req, res, db, mc) => {
	const { name, email, message } = req.body;
	if (validateEmail(email) && name && message) {

		const mail = mc({
			from: `${name} <${email}>`,
			to: 'info@cantotalk.com',
			subject: 'CantoTalk - Contact Us',
			body: 'Test email text',
			html: `<b>${message}</b>`
		})

		mail.build(function(mailBuildError, message) {
			const data = {
		        to: 'info@cantotalk.com',
		        message: message.toString('ascii')
		    };

		    mailgun.messages().send(data, (error, body) => {
			    if (error) {
				  	res.status(400).json(new EmailError())
			    } else if (body) {
				  	db('messages')
						.returning('*')
						.insert({
							name: name,
							email: email,
							date_sent: new Date()
						})
						.then(message => res.json(message))
						.catch(() => res.status(400).json(new ServerError()))
			    }
			});
		}
	}
}


module.exports = {
	handleContact,
}