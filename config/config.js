// VATSAL GABANI [gabanivatsal17@gmail.com]

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  database: process.env.DATABASE_URI,
  jwtSecret: process.env.JWT_SECRET,
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
};
