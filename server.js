//Install express server
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('./dist/features-app'));

app.get('/*', function(req,res) {

res.sendFile(path.join(__dirname,'/dist/features-app/index.html'));
});

app.listen(process.env.PORT || 8080);
