# daama

# Hyperledger Fabric Sample Project

### Introduction

Sample start-up project to initiate a Fabric project based on Fabric hlfv11. In this application, there are two participants and one assert which can be transferd from one participant to another.

  - Sample Participant (Buyer , Seller)
  - Sample Assert (Invoice)
  - Transactions 
    - Enroll buyer/seller of the network
    - Create Invoice
    - Invoice Created (event)
    - Accept invoice
    - Make Payment
    - Payment Received
    - Settle Invoice

### Pre-requisites
Please visit the [installation instructions](https://hyperledger.github.io/composer/latest/installing/installing-prereqs.html) to ensure you have the correct prerequisites installed for the development environment. Please use the version of the documentation that matches the version of the software you intend to use to ensure alignment.
Also make sure to keep an active internet connection throughout the process.

> nvm v8.11.3
  -composer-cli@0.19.12
  -composer-client@0.19.12
  -composer-rest-server@0.19.12
  -generator-hyperledger-composer@0.19.12
  -npm@5.6.0

> docker version 18.03.1-ce
> docker-compose version 1.21.2

### Getting Started

Download the Project.

Make sure to export environment variable for Fabric version to use the hlfv11

```sh
$ export FABRIC_VERSION=hlfv11
```

Navigate to Project folder
```sh
$ cd {projectFolder}
```
Download Fabric 
```sh
$ ./fabric-tools/downloadFabric.sh
```

Start Fabric
```sh
$ ./fabric-tools/startFabric.sh
```
Make sure all the fabric docker containter are up and running
```sh
$ docker ps
```
Create PeerAdmin Card
```sh
$ ./fabric-tools/createPeerAdminCard.sh
```
Once the card is successfully created and imported in to the composer verify the card list
```sh
$ composer card list
```
### Development

##### Deploying Business Network
Deploying a business network to the Hyperledger Fabric requires the Hyperledger Composer business network to be installed on the peer, then the business network can be started, and a new participant, identity, and associated card must be created to be the network administrator. Finally, the network administrator business network card must be imported for use, and the network can then be pinged to check it is responding.

Change the Project Files Accordingly to requirement
- `/lib/logic.js` - All the logic for transaction chaincode
- `/models/org.distro.biz.cto` - Sample model file
- `permissions.acl` - Access control logic
- `queries.qry` - Query file with fabric network

Generate Business Network Archive

From `{projectFolder}` run
Run 
```sh
$ composer archive create -t dir -n .
```
After the command has run, a business network archive file called business-network@0.0.1.bna has been created in the `{projectFolder}` directory.

Install the business network 
```sh
composer network install --card PeerAdmin@hlfv1 --archiveFile business-network@0.0.1.bna
```

Start the business network

```sh
$ composer network start --networkName business-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1
```

Starting composer network will generate the admin card to the network which is ready to be imported as business network card.
To import business network card, Run
```sh
$ composer card import --file admin@business-network.card
```

To verify business network card imported successfully to the network,
Run
```sh
$ composer network ping --card admin@business-network.card
```

##### Generate and Intergrate composer REST API
Hyperledger Composer can generate a REST API based on a business network. In this scenario generate the REST API on the docker as a container.

Extract `myComposer.zip` from `{projectFolder}/utility`
Go to `myComposer`
Build the docker images using the docker file in it with tag `multi/composer-rest-server`
```sh
$ cd {projectFolder}/utility/myComposer/
$ docker build -t multi/composer-rest-server .
```

After the image built successfully navigate to project root folder and run start composer rest server sh.
```sh
$ cd {projectFolder}
$ ./fabric-tools/startComposerRESTServer.sh
```

Check multi/composer-rest-server container by running 
```sh
$ docker ps
```
Check containter logs by
```sh
$ docker logs -f {CONTAINER ID}
```
*Changing the configuration for Composer REST server* - `/fabric-tools/startComposerRESTServer.sh`

Edit and the map volume of mongo db in the startComposerRESTServer.sh file
eg:
```
docker run -d --name mongo --network composer_default -p 27017:27017 -v {projectFolder}/fabric-tools/fabric-scripts/hlfv1/composer/mongo:/data/db mongo
```

REST API can be accessed locally from
`http://localhost:9999/explorer/#/`

## Secuirty and Enrollment

API security and authentication is handled by passport jwt with linked mongo db. 
Seperate module is enclosed to handle security and enrollment as *API Gateway*

Extract APIGateway.zip from the root folder and build the image respect to APIGateway.

Extract `APIGateway.zip` from `{projectFolder}`
Go to `APIGateway`

```
$ cd {parentFolder}/utility/APIGateway/
```

Edit and map volumes in docker-compose.yml
```
volumes:
      - {projectFolder}:/cards
 and     
volumes:
      - {projectFolder}/utility/APIGateway/mongo:/data/db
```

```
$ docker build -t apigateway .
```

Start APIGateway
```
$ ./startAPIGateway.sh
```

There are four endpoints corresponding to enrollment of participant.

| API            |    TYPE       | Description  |
| :------------- |:-------------| :-----|
| api/users      | POST          | Create user |
| api/users      | GET           |   Get users |
| api/login      | POST          |   Authenticate user |
| api/v2/enroll  | POST          |    Enroll user to Fabric   |
| api/authenticate  | POST       |    authenticate user to Fabric and get token  |


#### 1. api/users
- **URL**
    http://localhost:8080/api/users

- **Method**
    POST

- **URL Params** (x-www-form-urlencoded)
userId=[String]
email=[String]
password=[String]

- **Success Response**
User registraion successful.....

- **Error Response**
User registraion failed.....


#### 2. api/users
- **URL**
    http://localhost:8080/api/users

- **Method**
    GET

- **URL Params** (x-www-form-urlencoded)
None

- **Success Response**
 {
        "_id": "xxx",
        "userId": "xxx",
        "email": "xx@xx.com",
        "password": "xxx",
        "userName": "xxx",
        "__v": 0
    }

- **Error Response**
Error retireving users...

#### 3. api/login 
- **URL**
    http://localhost:8080/api/login

- **Method**
    POST

- **URL Params** (x-www-form-urlencoded)
userId=[String]
password=[String]

- **Success Response**
{
    "status": "OK",
    "bearer_token": "xxx"
}

- **Error Response**
Invalid User/ Invalid Password


#### 4. api/v2/enroll 
- **URL**
   http://localhost:8080/api/v2/enroll

- **Method**
    POST

- **Header**
Authorization=[Bearer `token`]
Note: `bearer_token` from login API

- **URL Params** (x-www-form-urlencoded)
userId=[String]
role=[String]
participantId=[String]

- **Success Response**
partcipant enrolled successfully

- **Error Response**
Unautherized

#### 5. api/authenticate 
- **URL**
    http://localhost:8080/api/authenticate

- **Method**
    POST

- **URL Params** (x-www-form-urlencoded)
userId=[String]
password=[String]

- **Success Response**
{
    "status": "OK",
    "user_access_token": "xxx"
}

- **Error Response**
Invalid User/ Invalid Password



*Changing the configurations for APIGateway* - `APIGateway/Config.js`

**HAPPY CODING**




