const router = require('express').Router();
const db = require('../db');
const passport = require('../auth/strategy');

router.get('/users', (req, res) => {
    
    const User = db.get('User');
    (async ()=> {

        try {
        
            const users = await User.find();

            res.status(200).send(users);
            return;

        } catch (err) {
            console.log(err.stack);
            res.status(500).send('Error retireving users...');
        }

        
    })();
    
    
});


router.post('/users', (req, res) => {

   ( async () => {

        const User = db.get('User');

        try {
            
            const user = await User.findOne({userId: req.body.userId});
            console.log('User creation request with : '+req.body);
            if (!user){
                await  User.create([{
                    userId  :   req.body.userId,
                    email   :   req.body.email,
                    password:   req.body.password,
                    userName:   req.body.userName,
                    name    :   req.body.name,
                    address :   req.body.address,
                    telephone   :   req.body.telephone
                }]);

                res.status(201).send('User registraion successful.....');
                return;
            }else{
                res.status(501).send('User already exists.....'); 
            }     

        } catch (err) {
            console.log(err.stack);
            res.status(501).send('User registraion failed.....');
        }
    
    })();
    
});


router.put('/users', (req, res) => {

});

module.exports = router;