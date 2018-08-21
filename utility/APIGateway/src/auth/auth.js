
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const fs = require('fs');
const db = require('../db');
const passport = require('./strategy');
const request = require('request-promise');

router.post('/login', (req, res) => {

    (async () => {

        const User = db.get('User');
        
        try {
            
            console.log('Login User : '+req.body.userId);
            const user = await User.findOne({ userId: req.body.userId });
            //access_token from jwt auth
            const enrollment = await User.aggregate([
                {
                      $lookup: {
                           from: "enrollments",
                           localField: "_id",
                           foreignField: "userId",
                           as: "tokenMap"
                        }
                    }, 
                    {
                      $match: { userId : req.body.userId }
                   }
                ])

            const user_access_token = enrollment[0].tokenMap[0].access_token;

            console.log('access token for user '+ req.body.userId +' : '+user_access_token);

            if (user) {
                if (user.password === req.body.password) {
                    //payload should have atleast one element with id has key     
                    // const payload = { id: user.userId };
                    // const token = jwt.sign(payload, config.jwt.secretOrKey, { noTimestamp: true });
                
                    res.status(201).json({ status: 'OK', user_access_token : user_access_token });
    
                } else {
                    res.status(401).send('Login User | Invalid Password');
                }
    
            } else {
                res.status(401).send('Login User | Invalid User');
            }        

        } catch (err) {
            res.status(401).send('Login User | Invalid User');
        }
    })();


});

router.post('/authenticate', (req, res) => {

    (async () => {

        const User = db.get('User');
        
        try {
            
            console.log('Authenticating User : '+req.body.userId);
            const user = await User.findOne({ userId: req.body.userId });

            if (user) {
                if (user.password === req.body.password) {
                    //payload should have atleast one element with id has key     
                    const payload = { id: user.userId };
                    const token = jwt.sign(payload, config.jwt.secretOrKey, { noTimestamp: true });
                
                    res.status(201).json({ status: 'OK', bearer_token: token });
    
                } else {
                    res.status(401).send('Authenticating User | Invalid Password');
                }
    
            } else {
                res.status(401).send('Authenticating User | Invalid User');
            }        

        } catch (err) {
            res.status(401).send('Authenticating User | Invalid User');
        }


    })();


});


// router.post('/v2/enroll', passport.authenticate('jwt', { session: false }), (req, res) => {
router.post('/v2/enroll', (req, res) => {
    
    //Validate whether participant is already enrolled
    (async () => {

        const User = db.get('User');
        const Enrollment = db.get('Enrollment');


        try {

            const user = await User.findOne({ userId: req.body.userId });
            if (!user) {
                res.status(400).send(`Invalid user: ${req.body.userId}`);
                return;
            }

            const partcipant = await Enrollment.findOne({ userId: user._id});
            
    
            if (partcipant) {
                res.status(400).send(`user ${req.body.userId} already enrolled`);
                return;
            }

            const partcipant1 = await Enrollment.findOne({ participantId: req.body.participantId });
            if (partcipant1) {
                res.status(400).send(`participant ${req.body.participantId} already exists`);
                return;
            }
            
            //Partcipant creation sequence
            var role, _class = '';
            console.log('Role submitted : '+req.body.role);
            switch (req.body.role) {
                case 'Buyer':
                    role = 'Buyer';
                    _class = "org.distro.biz.Buyer";
                    break;
                case 'Seller':
                    role = 'Seller';
                    _class = "org.distro.biz.Seller";
                    break;
                default:
                    role = 'Seller';
                    _class = "org.distro.biz.Seller";
                    break;
            }

            //Create partcipant based on role
            console.log('Create partcipant based on role');
            await request({
                uri: `${config.composer.admin_url}/api/${role}`,
                method: 'POST',
                body: {
                    $class: _class,
                    id: req.body.participantId,
                    name:req.body.name,
                    address:req.body.address,
                    telephone:req.body.telephone
                },
                json: true
            });


            // Issue Identity for the participant
            console.log('Issue Identity for the participant');
            const card = await request({
                uri: `${config.composer.admin_url}/api/system/identities/issue`,
                method: 'POST',
                body: {
                    participant: `resource:${config.composer.namespace}.${role}#${req.body.participantId}`,
                    userID: req.body.userId
                },
                json: true,
                encoding: null

            });
            fs.writeFileSync(
                `${config.composer.card_store}/${req.body.participantId}@${config.composer.business_network}.card`,
                card
            );


            // jwt auth to fetch access token
            console.log('jwt auth to fetch access token');
            const jwt_token = req.get('Authorization').split(' ')[1];

            var access_token;
            var cookieJar = request.jar();

            await request.get(`${config.composer.url}/auth/jwt/callback?token=${jwt_token}`, { jar: cookieJar })

            const expr = /s\%3A(.*)\./;
            cookie_value = cookieJar.getCookies(config.composer.url)[0]['value'];
            const value = cookie_value.match(expr);
            if (value) {
                access_token = value[1];
            }

            console.log('access_token : '+access_token);


            // Import Identity card into wallet
            console.log('Import Identity card into wallet');
            const response = await request({
                uri: `${config.composer.url}/api/wallet/import?token=${jwt_token}`,
                method: 'POST',
                formData: {
                    card: fs.createReadStream(`${config.composer.card_store}/${req.body.participantId}@${config.composer.business_network}.card`)
                },
                jar: cookieJar
            });

            // create enrollment entry
            console.log('create enrollment entry');
            var result = await Enrollment.create([{
                userId: user._id,
                participantId: req.body.participantId,
                access_token: access_token
            }]);

            console.log('Enrollment Result '+result);

            res.status(200).send('partcipant enrolled successfully');

        } catch (error) {
            console.log(error.stack);
            res.status(400).send(error.message);
            return;
        }
    })();


});





router.get('/test', (req, res) => {

    const jwt_token = req.get('Authorization').split(' ')[1];
    const expr = /access_token=s\%3A(.*)\./;

    var access_token;
    var cookieJar = request.jar();
    // request.defaults({jar:cookieJar});
    request.get(`${config.composer.url}/auth/jwt/callback?token=${jwt_token}`, { jar: cookieJar })
        // .on('redirect', function () {

        //     this.response.headers['set-cookie'].forEach(cookie => {
        //         cookieJar.setCookie(cookie,config.composer.url);
        //         const value = cookie.match(expr);
        //         if (value) {
        //             access_token = value[1];
        //         }


        //     });

        // })
        .on('response', response => {

            console.log(cookieJar.getCookies(config.composer.url));

            //     const expr = /access_token=s\%3A(.*)\./;
            //     this.response.headers['set-cookie'].forEach(cookie => {
            //         // cookieJar.setCookie(cookie,config.composer.url);
            //         const value = cookie.match(expr);
            //         if (value) {
            //             access_token = value[1];
            //         }

            request.get('http://localhost:8080/api/cookietest', { jar: cookieJar })
                .on('response', response => {


                    res.send(`Access Token: ${access_token}`);
                })


        });



});

router.get('/cookietest', (req, res) => {
    console.log(req.cookies);

    res.send('OK');
});


module.exports = router;