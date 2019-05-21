const validateEmail = (email) => {
	const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regexp.test(email);
}

const generateToken = () => {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (var i = 26; i > 0; --i) {
      token += chars[Math.round(Math.random() * (chars.length - 1))];
    }

    let expires = new Date();
    expires.setHours(expires.getHours() + 6);

    return {token, expires}
}

module.exports = {
  validateEmail,
  generateToken
}