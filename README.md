# Summarizing transactions from CSV log

[Original Question](https://gist.github.com/liangzan/4436cb8b083c66b3517e7f4d80939f06)

This is a [Node.js](https://nodejs.org/) command line program for parsing csv file and getting portfolio value from crypto investment log file.

## Design for Programming

The log csv file has over 3 million lines and file size is also over 950MB. So it takes long time for parsing csv file. The most important thing in this program is to reduce execution time.
This program use `n-readlines` library for reading csv file.
That's because program can be stopped reading at any time.

This program is written to be run in following 4 conditions:

- Given no parameters, return the latest portfolio value per token in USD
- Given a token, return the latest portfolio value for that token in USD
- Given a date, return the portfolio value per token in USD on that date
- Given a date and a token, return the portfolio value of that token in USD on that date

Used algorithm is as following:

- In cases of given no date parameters, program stops reading after deciding the latest date.
  Csv file is a log file so it is assumed that a timestamp is sorted as ascending or descending order. So date is changed then program stops reading csv file.
  This means csv file is filtered by date first.
- And then program is filtered by tokens on the basis of filtering by date.

## Setting Environments

First, install npm packages:

```bash
npm install
```

Second, create `.env` file in project folder and add following.

```bash
# .env
API_KEY = # your api key for cryptocompare
API_URL = https://min-api.cryptocompare.com/data/price
```

Third, create `assets` directory in project folder and copy csv log file(i.e: `transactions.csv` file).
And replace the file name in `config.js` file.

```javascript
// config.js
const dotenv = require('dotenv');

dotenv.config();
module.exports = {
  apiUrl: process.env.API_URL,
  apiKey: process.env.API_KEY,
  reTokenOption: /^-t$/i,
  reDateOption: /^-d$/i,
  csvFile: './assets/transactions.csv', // replace here
};
```

## Getting Started

To run the command line program, follow below instructions:

- Given no parameters, return the latest portfolio value per token in USD

```bash
node index.js
```

- Given a token, return the latest portfolio value for that token in USD

```bash
node index.js -t ETH
```

- Given a date, return the portfolio value per token in USD on that date

```bash
node index.js -d 2019-10-25
```

- Given a date and a token, return the portfolio value of that token in USD on that date

```bash
node index.js -t ETH -d 2019-10-25
```
