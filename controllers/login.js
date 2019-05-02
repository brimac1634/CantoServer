const { ServerError, ValidationError } = require('../errorCodes')

const validateEmail = (email) => {
	const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regexp.test(email);
}

const validatePassword = (password) => {
	return password.length >= 6;
}


const handleSignIn = (req, res, db, bcrypt) => {
	const { email, password } = req.body;
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
				throw new ValidationError('wrong credentials')
			}
		})
		.catch(err => {
			const error = err.isCustom ? err : new ServerError()
			res.status(400).json(error)
		})
}

const handleRegister = (req, res, db, bcrypt) => {
	const { email, password } = req.body;
	const emailIsValid = validateEmail(email);
	const passwordIsValid = validatePassword(password);
	if (!emailIsValid || !passwordIsValid) {
		return res.status(400).json(new ValidationError('wrong credentials'))
	}
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
			.returning('*')
			.insert({
				email: loginEmail[0],
				joined: new Date()
			})
			.then(user => res.json(user[0]))
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json(new ServerError()))
}

module.exports = {
	handleSignIn,
	handleRegister
}