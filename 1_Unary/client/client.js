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

// Use SSL/TLS credentials instead of insecure connection
const sslCreds = grpc.credentials.createSsl(
    fs.readFileSync(process.env.GRPC_CA_CERT_PATH || path.join(__dirname, 'certs', 'ca.crt')),
    fs.readFileSync(process.env.GRPC_CLIENT_KEY_PATH || path.join(__dirname, 'certs', 'client.key')),
    fs.readFileSync(process.env.GRPC_CLIENT_CERT_PATH || path.join(__dirname, 'certs', 'client.crt'))
)

const client = new userPackageDefinition.UserService("localhost:50051",
    sslCreds
)

function getUserInfo(){
    var request = {
        user: {
            first_name: "Borna",
            last_name: "Nematzadeh"
        }
    }

    client.getUser(request, (error, response) => {
        if(!error){
            console.log("Server Response:", response.result)
        }else{
            console.error(error)
        }
    })
}


function main(){
    getUserInfo()
}

main()