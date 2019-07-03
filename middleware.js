const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
const { InvalidToken, NoTokenFound } = require('./errorCodes');

const checkToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];

  if (token) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
  
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        return res.status(400).json(new InvalidToken())
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(400).json(new NoTokenFound())
  }
};

module.exports = {
  checkToken: checkToken
}