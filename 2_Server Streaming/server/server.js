const path = require('path');
const fs = require('fs');

const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

// grpc service definition
const userProtoPath = path.join(__dirname, '..', 'Protos', 'user.proto');
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Create the package definition
const userPackageDefinition = grpc.loadPackageDefinition(userProtoDefinition).user;

function getUser(call, callback){
  const first_name = call.request.user.first_name;
  const last_name = call.request.user.last_name;
  const id = 1;
  const email = 'test@gmail.com';

  callback(null, {result: {first_name, last_name, id, email}});
}


function getManyUsers(call, _){
  const firstName = call.request.user.first_name;

  let count = 0,
    intervalID = setInterval(() => {

      call.write({result: firstName});
      if (++count > 7) {
        clearInterval(intervalID);
        call.end();
      }
    }, 1000);
}

function main(){
  const server = new grpc.Server();
  server.addService(userPackageDefinition.UserService.service, {
    getUser: getUser,
    getManyUsers: getManyUsers,
  });

  // Use secure credentials with SSL/TLS
  const serverCredentials = grpc.ServerCredentials.createSsl(
    fs.readFileSync(process.env.GRPC_ROOT_CERT || path.join(__dirname, 'certs', 'ca.crt')),
    [{
      cert_chain: fs.readFileSync(process.env.GRPC_SERVER_CERT || path.join(__dirname, 'certs', 'server.crt')),
      private_key: fs.readFileSync(process.env.GRPC_SERVER_KEY || path.join(__dirname, 'certs', 'server.key')),
    }],
    true,
  );

  server.bind('127.0.0.1:50051', serverCredentials);
  server.start();
  console.log('Server is running on port 50051');
}

main();