var express = require('express');
  app = express(),
  Client = require('node-rest-client').Client,
  client = new Client(),
  Md5 = require('md5'),
  bodyParser = require('body-parser');

function proxy() {
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))
  // parse application/json
  app.use(bodyParser.json())

  app.listen(3000, () => {
    console.log('Proxy on http://localhost:3000/');
  });

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:8000");
    res.header("Access-Control-Allow-Credentials", true);
    next();
  });

  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateUrl() {
    const base = 'http://gateway.marvel.com/v1/public/characters?',
      apiKey = '04bbc7aed211dea82a9012da2d8c3582',
      limit = 50,
      total = 1485 - limit,
      offset = getRandomInt(1, total),
      privateKey = '2a5bcb9d808a7f3173bfa17b926ac8664a3e6e32',
      ts = new Date().getTime(),
      hash = Md5(`${ts}${privateKey}${apiKey}`),
      url = `${base}limit=${limit}&offset=${offset}&apikey=${apiKey}&ts=${ts}&hash=${hash}`;
    return url;
  }

  app.get('/marvel/characters', (req, res) => {
    var allData = [];
    client.get(generateUrl(), (data1) => {
      console.log('first request');
      console.log(data1.length);
      if (data1.length) {
        allData.push(data1);
      }
      client.get(generateUrl(), (data2) => {
        console.log('second request');
        console.log(data2.length);
        if (data2.length) {
          allData.push(data2);
        }
        res.send(allData);
      });
    });
  });
}


module.exports = proxy;
