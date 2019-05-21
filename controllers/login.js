const api_key = process.env.MG_API_KEY;
const DOMAIN = process.env.MG_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
const { 
	ServerError, 
	ValidationError,
	PasswordTokenExpired,
	EmailNotRegistered, 
	UserNotFound 
} = require('../errorCodes');
const { validateEmail, generateToken } = require('../helpers/utils');
const { URL } = require('../helpers/constants');

const validatePassword = (password) => {
	return password.length >= 6;
}


const handleSignIn = (req, res, db, bcrypt) => {
	let { email, password } = req.body;
	email = email.toLowerCase()
	const emailIsValid = validateEmail(email);
	const passwordIsValid = validatePassword(password);
	if (!emailIsValid || !passwordIsValid) {
		return res.status(400).json(new ValidationError('wrong credentials'))
	}
	db.select('email', 'hash').from('login')
		.where('email', '=', email)
		.then(data => {
			if (data[0]) {
				const isValid = bcrypt.compareSync(password, data[0].hash)
				if (isValid) {
					return db.select('*').from('users')
						.where('email', '=', email)
						.then(user => {
							res.json(user[0])
						})
						.catch(err => res.status(400).json(new ServerError()))
				} else {
					throw new ValidationError('wrong credentials')
				}
			} else {
				throw new EmailNotRegistered()
			}
		})
		.catch(err => {
			const error = err.isCustom ? err : new ServerError()
			res.status(400).json(error)
		})
}

const handleRegister = (req, res, db) => {
	let { email } = req.body;
	email = email.toLowerCase()
	const emailIsValid = validateEmail(email);
	if (!emailIsValid) {
		return res.status(400).json(new ValidationError('wrong credentials'))
	}
	db.select('email').from('login')
		.where('email', '=', email)
		.then(data => {
			if (data[0] != null) {
				throw new EmailTakenError()
			} else {
				const { token, expires } = generateToken()
				db.transaction(trx => {
					trx.insert({
						hash: 'unverified',
						email: email
					})
					.into('login')
					.returning('email')
					.then(loginEmail => {
						return trx('users')
						.returning('*')
						.insert({
							email: loginEmail[0],
							joined: new Date(),
							token: token,
							token_expires: expires 
						})
						.then(user => {
							const data = {
							    from: `no-reply@cantotalk.com`,
							    to: email,
							    subject: 'CantoTalk - Email Verification',
							    text: `Please follow the link below to verify your email address: ${URL}/verify?token=${token}
							    . This link will remain valid for 6 hours.`
							};

							mailgun.messages().send(data, (error, body) => {
							    if (error) {
							    	res.status(400).json(new EmailError())
							    } else if (body) {
							  		res.json(user[0])
							    }
							});
						})
						.catch(() => {
							res.status(400).json(new ServerError())
						})
					})
					.then(trx.commit)
					.catch(trx.rollback)
				})
			}
		})
		.catch(err => {
			console.log(err)
			const error = err.isCustom ? err : new ServerError()
			res.status(400).json(error)
		})
	
}

const completeRegistration = (req, res, db, bcrypt) => {
	const { password, token } = req.body;
	const passwordIsValid = validatePassword(password);
	if (!passwordIsValid) {
		return res.status(400).json(new ValidationError('wrong credentials'))
	}
	const now = new Date();
	db.select('*').from('users')
		.where('token', '=', token)
		.then(data => {
			const user = data[0];
			if (user != null) {
				if (now > user.token_expires) {
					throw new PasswordTokenExpired()
				} else {
					const hash = bcrypt.hashSync(password);
					db.transaction(trx => {
						trx.select('*').from('login')
						.where('email', '=', user.email)
						.update({hash: hash})
						.returning('email')
						.then(email => {
							return trx.select('*').from('users')
							.where('email', '=', email[0])
							.update({token: ''})
							.returning('*')
							.then(user => {
								res.json(user[0])
							})
							.catch(() => {
								res.status(400).json(new ServerError())
							})
						})
						.then(trx.commit)
						.catch(trx.rollback)
					})
				}
			} else {
				throw new UserNotFound()
			}
		})
		.catch(err => {
			const error = err.isCustom ? err : new ServerError()
			res.status(400).json(error)
		})
}

module.exports = {
	handleSignIn,
	handleRegister,
	completeRegistration
}