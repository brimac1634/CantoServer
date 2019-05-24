const { 
	ServerError, 
	ValidationError,
	PasswordTokenExpired,
	EmailNotRegistered, 
	UserNotFound,
	RegistrationIncomplete 
} = require('../errorCodes');
const { validateEmail, generateToken, sendMail, addUserToMailList } = require('../helpers/utils');
const { URL } = require('../helpers/constants');


const validatePassword = (password) => {
	return password.length >= 6;
}

const sendVerificationEmail = (user, res) => {
	const { email, token } = user;
	const link = `${URL}/verify?token=${token}`
	sendMail({
		fromEmail: 'no-reply@cantotalk.com',
		toEmail: email,
		subject: 'CantoTalk - Email Verification',
		template: 'emailVerification',
		params: {link},
		ifSuccess: ()=>{
			res.json(user)
		},
		ifError: ()=>{
			res.status(400).json(new EmailError())
		}
	})
}

const handleSignIn = (req, res, db, bcrypt) => {
	let { email, password } = req.body;
	email = email.toLowerCase()
	const emailIsValid = validateEmail(email);
	const passwordIsValid = validatePassword(password);
	if (!emailIsValid || !passwordIsValid) {
		return res.status(400).json(new ValidationError())
	}
	db.select('email', 'hash').from('login')
		.where('email', '=', email)
		.then(data => {
			if (data[0].email) {
				if (data[0].hash === 'unverified') {
					throw new RegistrationIncomplete()
				} else {
					const isValid = bcrypt.compareSync(password, data[0].hash)
					if (isValid) {
						return db.select('*').from('users')
							.where('email', '=', email)
							.then(user => {
								res.json(user[0])
							})
							.catch(err => res.status(400).json(new ServerError()))
					} else {
						throw new ValidationError()
					}
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



const handleRegister = (req, res, db, mc) => {
	let { name, email } = req.body;
	email = email.toLowerCase()
	const emailIsValid = validateEmail(email);
	if (!emailIsValid) {
		return res.status(400).json(new ValidationError())
	}

	db.select('email').from('login')
		.where('email', '=', email)
		.then(data => {
			const { token, expires } = generateToken()
			if (data[0] != null) {
				return db('users')
					.returning('*')
					.where('email', '=', data[0].email)
					.update({
						token: token,
						token_expires: expires
					})
					.then(userData => {
						const user = userData[0];
						sendVerificationEmail(user, res)
					})
					.catch(err => {
						console.log(err)
						res.status(400).json(new ServerError())
					})
			} else {
				if (name != null) {
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
								name: name,
								email: loginEmail[0],
								joined: new Date(),
								token: token,
								token_expires: expires 
							})
							.then(userData => {
								const user = userData[0];
								sendVerificationEmail(user, res)
							})
							.catch(() => {
								res.status(400).json(new ServerError())
							})
						})
						.then(trx.commit)
						.catch(trx.rollback)
					})
				} else {
					throw new EmailNotRegistered()
				}
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
		return res.status(400).json(new ValidationError())
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
							.update({token_expires: new Date()})
							.returning('*')
							.then(userData => {
								const user = userData[0];
								sendMail({
									fromEmail: 'no-reply@cantotalk.com',
									toEmail: user.email,
									subject: 'CantoTalk - Verification Complete',
									template: 'verificationComplete',
									ifSuccess: ()=>{
										res.json(user)
									},
									ifError: ()=>{
										res.status(400).json(new EmailError())
									}
								})
								addUserToMailList(user.email)
								res.json(user)
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
	completeRegistration,
}