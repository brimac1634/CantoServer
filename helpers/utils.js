const api_key = process.env.MG_API_KEY;
const DOMAIN = process.env.MG_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
const knex = require('knex');
const mailList = mailgun.lists(`mail-list@${DOMAIN}`)
const { generateHTML } = require('./HTMLGenerator');

const configureDB = () => {
  if (process.env.PORT == 3000) {
    return knex({
      client: 'pg',
      connection: {
        host : '127.0.0.1',
        user : 'brianmacpherson',
        password : '',
        database : 'cantotalk'
      }
    });
  } else {
    return knex({
      client: 'pg',
      connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
      }
    });
  }
}

async function sendMail({
  name = 'CantoTalk',
  fromEmail = 'info@cantotalk.com',
  toEmail,
  subject,
  message,
  template,
  params,
  ifSuccess,
  ifError
}) {
  let html = ''
  if (template != null) {
    html = await generateHTML(template, params);
  } else {
    html = `<p>${message}</p>`
  }

  const data = {
      from: `${name} <${fromEmail}>`,
      to: toEmail,
      subject,
      html
   };

    mailgun.messages().send(data, (error, body) => {
        if (error) {
          ifError(error)
        } else if (body) {
          ifSuccess(body)
        }
    });
}

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
  configureDB,
  validateEmail,
  generateToken,
  sendMail,
  addUserToMailList
}