﻿var express = require('express');

var app = express();

app.use(express.static(__dirname));

app.listen(8100);
console.log('Listening on port 8100');


var athlete = {};
