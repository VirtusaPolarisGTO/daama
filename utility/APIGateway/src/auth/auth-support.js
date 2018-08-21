const db = require('../db');

function AuthSupport(){
    this.validateParticipant = async function(participantId){
        

        
            db.get().collection('enrollments').findOne({participantId:participantId}).then((result) => {
                console.log(result);
                return {status: false, message: 'Participant already enrolled' };
            }).catch((error) => {
                return {status: false, message: 'Error validating partcipant'};
            });

            
            
            
        
            // if (result) {
            //     // return {status: false, message: 'Participant already enrolled' };
                
            // }else{
            //     // return {status: true, message: '' };
            // }

        
    }
}

module.exports = new AuthSupport();