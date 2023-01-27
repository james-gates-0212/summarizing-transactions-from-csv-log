// config.js
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  apiUrl: process.env.API_URL,
  apiKey: process.env.API_KEY,
  reTokenOption: /^-t$/i,
  reDateOption: /^-d$/i,
  csvFile: './assets/transactions.csv',
};
