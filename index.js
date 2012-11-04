module.exports = process.env.JWDCOV
  ? require('./lib-cov/jwebdriver')
  : require('./lib/jwebdriver');