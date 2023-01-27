const lineByLine = require('n-readlines');
const axios = require('axios');
const moment = require('moment');
const {
  apiUrl,
  apiKey,
  reTokenOption,
  reDateOption,
  csvFile,
} = require('./config');

const skips = [reTokenOption, reDateOption];

const getArgValue = (args, opt) => {
  if (!args || !args.length) {
    return null;
  }
  const optionPos = args.findIndex((v) => opt.test(v));
  if (optionPos == -1) {
    return null;
  }
  const valuePos = optionPos + 1;
  if (
    args.length > valuePos &&
    !skips.some((v) => v.test(args[valuePos]))
  ) {
    return args[valuePos];
  }
  return null;
};

const safeDate = (date) => {
  if (!date) {
    return date;
  }
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)) {
    console.log('Invalid date');
    return false;
  }
  return date
    .split(/-/)
    .map((v) => (Number.parseInt(v) < 10 ? `0${v}` : v))
    .join('-');
};

const getData = (file, token = null, date = null) => {
  if (date && date > moment().format('YYYY-MM-DD')) {
    return {};
  }

  const liner = new lineByLine(file);

  const TIMESTAMP = 0;
  const TYPE = 1;
  const TOKEN = 2;
  const AMOUNT = 3;

  let rows = {};

  let line;
  let latestDate = date;

  const tokenFilter = new RegExp(`^${token}$`, 'i');

  liner.next();

  let found = false;

  while ((line = liner.next())) {
    const row = line.toString().split(/[ ]*,[ ]*/);
    const rowDate = moment
      .unix(Number(row[TIMESTAMP]))
      .format('YYYY-MM-DD');
    if (date && rowDate !== date) {
      if (found) {
        break;
      }
      continue;
    }
    found = true;
    if (token && !tokenFilter.test(row[TOKEN])) {
      continue;
    }
    if (!latestDate || latestDate < rowDate) {
      latestDate = rowDate;
      rows = {};
    }
    if (latestDate > rowDate) {
      break;
    }
    const rowToken =
      token?.toUpperCase() ?? row[TOKEN].toUpperCase();
    const key = `${latestDate}-${rowToken}`;
    if (!rows[key]) {
      rows[key] = {
        date: latestDate,
        token: rowToken,
        deposit: 0,
        withdrawal: 0,
      };
    }
    rows[key].deposit += /^deposit$/i.test(row[TYPE])
      ? Number(row[AMOUNT])
      : 0;
    rows[key].withdrawal += /^withdrawal$/i.test(row[TYPE])
      ? Number(row[AMOUNT])
      : 0;
  }

  return rows;
};

const convertUSD = (data) => {
  !Object.keys(data).map((key) => {
    const row = data[key];
    axios
      .get(`${apiUrl}?fsym=${row.token}&tsyms=USD`, {
        headers: {
          Authorization: `Apikey ${apiKey}`,
        },
      })
      .then((res) => {
        console.log(
          [
            row.date,
            row.token,
            `DEPOSIT:${(row.deposit * res.data.USD).toFixed(
              2,
            )} USD`,
            `WITHDRAWAL:${(
              row.withdrawal * res.data.USD
            ).toFixed(2)} USD`,
          ].join(' '),
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }).length && console.log('No data found...');
};

const token = getArgValue(process.argv, reTokenOption);
const date = safeDate(
  getArgValue(process.argv, reDateOption),
);

if (date !== false) {
  convertUSD(getData(csvFile, token, date));
}
