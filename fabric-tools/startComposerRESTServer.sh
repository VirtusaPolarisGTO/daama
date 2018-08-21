. ~/.nvm/nvm.sh

nvm use --lts

docker container rm mongo -f
docker container rm composer-rest-server -f
docker container rm composer-rest-server-admin -f

docker run -d --name mongo --network composer_default -p 27017:27017 -v /home/amenda/Desktop/Hyperledger/distributor-network-2/fabric-tools/fabric-scripts/hlfv1/composer/mongo:/data/db mongo

export COMPOSER_CARD=admin@business-network
export COMPOSER_NAMESPACES=never

#Docker composer Admin REST server invocation
docker run \
    -d \
    -e COMPOSER_CARD=${COMPOSER_CARD} \
    -e COMPOSER_NAMESPACES=${COMPOSER_NAMESPACES} \
    -e COMPOSER_AUTHENTICATION=${COMPOSER_AUTHENTICATION} \
    -v ~/.composer:/home/composer/.composer \
    --name composer-rest-server-admin \
    --network composer_default \
    -p 9999:3000 \
    multi/composer-rest-server:latest


export COMPOSER_AUTHENTICATION=true
export COMPOSER_MULTIUSER=true



# Datasource provider for Docker composer REST server
export COMPOSER_DATASOURCES='{
    "db": {
        "name": "db",
        "connector": "mongodb",
        "host": "mongo"
    }
}'



# Custom jwt provider with Docker composer REST server
export COMPOSER_PROVIDERS='{
  "jwt": {
    "provider": "jwt",
    "module": "/home/composer/node_modules/custom-jwt.js",
    "secretOrKey": "E@rthSh!ne",
    "authScheme": "saml",
    "successRedirect": "/",
    "failureRedirect":"/"
    }
}'


# Docker composer REST server invocation - multi user mode
docker run \
    -d \
    -e COMPOSER_CARD=${COMPOSER_CARD} \
    -e COMPOSER_NAMESPACES=${COMPOSER_NAMESPACES} \
    -e COMPOSER_AUTHENTICATION=${COMPOSER_AUTHENTICATION} \
    -e COMPOSER_MULTIUSER=${COMPOSER_MULTIUSER} \
    -e COMPOSER_PROVIDERS="${COMPOSER_PROVIDERS}" \
    -e COMPOSER_DATASOURCES="${COMPOSER_DATASOURCES}" \
    -v ~/.composer:/home/composer/.composer \
    --name composer-rest-server \
    --network composer_default \
    -p 3000:3000 \
    multi/composer-rest-server:latest
