set JWDCOV=1
jscover lib lib-cov
mocha --reporter html-cov > coverage.html