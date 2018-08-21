const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('./config');
var db = null;
var models = {};

module.exports = {
    connect: async function(){
        
        try {
            
            await mongoose.connect(config.db.url);
            // db = mongoose.connection;
            
            const userSchema = new Schema({
                userId  :   String,
                email   :   String,
                password:   String,
                userName:   String
    
            });
    
            const User = mongoose.model('User',userSchema);
            models['User']=User;
            
            const enrollmentSchema = new Schema({
                userId: Schema.Types.ObjectId,
                participantId: String,
                access_token: String
    
            });
            
            const Enrollment = mongoose.model('Enrollment',enrollmentSchema);
            models['Enrollment']=Enrollment;
    
        } catch (err) {
            console.log(err.stack);
            process.exit(-1);
        }
    }
,

    get: function(model){
        return models[model];
    },


} ;



