'use strict';

const fs = require('fs');
const scrapper = require('./scrapper.js');
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/getData', (req, res) => {
  try {
    let pageContent = fs.readFileSync('./data.json', 'utf8');
    pageContent = JSON.parse(pageContent);
    res.json(pageContent);
  } catch (e) {
    console.error(e);
  }
});

app.get('/updateData', (req, res) => {
  scrapper.updateStatusData()
    .then(() => {
      try {
        let pageContent = fs.readFileSync('./data.json', 'utf8');
        pageContent = JSON.parse(pageContent);
        res.json(pageContent);
      } catch (e) {
        console.error(e);
      }
    })
    .catch(err => console.error(err));
});

app.listen(8080, () => console.log('Server is listening on port 8080.'));