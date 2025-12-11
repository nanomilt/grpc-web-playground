const path = require('path')
const protoLoader = require('@grpc/proto-loader')
const grpc = require('grpc')
const fs = require('fs')

// grpc service definition
const userProtoPath = path.join(__dirname, "..", "Protos", "user.proto")
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

// Create the package definition
const userPackageDefinition = grpc.loadPackageDefinition(userProtoDefinition).user;

function getUser(call, callback){
    var first_name = call.request.user.first_name;
    var last_name = call.request.user.last_name;
    var id = 1;
    var email = "test@gmail.com"

    callback(null, {result: {first_name, last_name, id, email}})
}


function main(){
    const server = new grpc.Server()
    server.addService(userPackageDefinition.UserService.service, {
        getUser: getUser
    })

    // Use SSL/TLS credentials instead of insecure connection
    const serverCredentials = grpc.ServerCredentials.createSsl(
        fs.readFileSync(process.env.GRPC_CA_CERT_PATH || path.join(__dirname, 'certs', 'ca.crt')),
        [{
            cert_chain: fs.readFileSync(process.env.GRPC_SERVER_CERT_PATH || path.join(__dirname, 'certs', 'server.crt')),
            private_key: fs.readFileSync(process.env.GRPC_SERVER_KEY_PATH || path.join(__dirname, 'certs', 'server.key'))
        }],
        true
    )

    server.bind("127.0.0.1:50051", serverCredentials)
    server.start()
    console.log("Server is running on port 50051");
}

main()