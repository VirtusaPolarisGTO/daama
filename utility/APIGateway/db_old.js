const mongoClient = require('mongodb').MongoClient;
const config = require('./config');
var db = null;



module.exports = {
    connect: function(){
        
        mongoClient.connect(config.db.url).then(client => {
            db = client.db('gateway');
        }).catch(err => {
            db=null;
            console.log(err.stack);
            process.exit(-1);
        });
    },

    get: function(){
        return db;
    }
} ;



