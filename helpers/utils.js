const api_key = process.env.MG_API_KEY;
const DOMAIN = process.env.MG_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
const mc = require('mailcomposer');
const mailList = mailgun.lists(`mail-list@${DOMAIN}`)

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

const sendMail = ({
  name = 'CantoTalk',
  fromEmail = 'info@cantotalk.com',
  toEmail,
  subject,
  html,
  ifSuccess,
  ifError
}) => {
  const mail = mc({
    from: `${name} <${fromEmail}>`,
    to: toEmail,
    subject: subject,
    html: html
  })

  mail.build((mailBuildError, message) => {
    if (mailBuildError != null) {
      console.log(mailBuildError)
    } else if (message != null) {
      console.log(message)
      const data = {
            to: toEmail,
            message: message.toString('ascii')
        };

        mailgun.messages().sendMime(data, (error, body) => {
          if (error) {
            ifError()
          } else if (body) {
            ifSuccess()
          }
      });
    }
  })
}

const addUserToMailList = (email) => {
  const newUser = {
      subscribed: true,
      address: email
  };
  mailList.members().create(newUser, function (error, data) {
    if (error) {
      console.log(error);
    } else if (data) {
      console.log(data);
    }
  });
}

module.exports = {
  validateEmail,
  generateToken,
  sendMail,
  addUserToMailList
}