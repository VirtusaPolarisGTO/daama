var config = {};

config.gateway = {
    port: 8080
}


config.composer = {
    url: "http://composer-rest-server:3000",
    admin_url: "http://composer-rest-server-admin:3000",
    // url: "http://localhost:3000",
    // admin_url: "http://localhost:9999",
    business_network: "distributor-network",
    namespace: "org.distro.biz",
    card_store: "/cards"
}

config.db = {
    url: "mongodb://gateway_mongo:27017/gateway"
    // url: "mongodb://localhost:37017/gateway"
}

config.jwt = {
    secretOrKey: "E@rthSh!ne"
}

config.admin = {
    access_token : "u3uoMDVP3iRrPuqCrqgNeRR4tuAMR9dGFFoyRDGxguDUg5QcoozOB4iLskfcfXEA"
}
module.exports = config;