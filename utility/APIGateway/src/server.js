var app = require('./index.js');
var config = require('./config.js');

app.listen(config.gateway.port, () => {
    console.log('API Gateway started....');
});
