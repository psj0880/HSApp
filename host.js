var express = require('express');
var app = express();
var route = require('./route.js');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use('/', route);
app.use((req, res, next) => {
    res.status(404).send('404Error!');
});
app.set('view engine', 'pug');
app.set('views', __dirname);

module.exports = app;