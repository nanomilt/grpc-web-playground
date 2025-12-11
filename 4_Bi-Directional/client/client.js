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


async function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  });
}
// Create the package definition
const userPackageDefinition = grpc.loadPackageDefinition(userProtoDefinition).user;

// Create secure SSL/TLS credentials
const sslCreds = grpc.credentials.createSsl(
  fs.readFileSync(path.join(__dirname, '..', 'certs', 'ca.crt')),
  fs.readFileSync(path.join(__dirname, '..', 'certs', 'client.key')),
  fs.readFileSync(path.join(__dirname, '..', 'certs', 'client.crt')),
);

const client = new userPackageDefinition.UserService('localhost:50051',
  sslCreds,
);

function getUserInfo(){
  const request = {
    user: {
      first_name: 'Borna',
      last_name: 'Nematzadeh',
    },
  };

  client.getUser(request, (error, response) => {
    if(!error){
      console.log('Server Response:', response.result);
    }else{
      console.error(error);
    }
  });
}

function callGetManyUsers(){

  const request = {
    user: {
      first_name: 'Borna',
    },
  };

  const call = client.getManyUsers(request, () => {});
  call.on('data', response => {
    console.log('Server Streaming Response: ', response.result);
  });

  call.on('end', () => {
    console.log('Streaming Ended!');
  });

}

function callLongMessage(){
  const request = {
    user: {
      first_name: 'Borna',
      last_name: 'Nematzadeh',
    },
  };


  const call = client.LongMessage(request, (error, response) => {
    if(!error){
      console.log('Server Response:', response.result);
    }else{
      console.error(error);
    }
  });

  let count = 0,
    intervalID = setInterval(() => {
      console.log(`Sending message ${ count}`);

      console.log(request.user.first_name);
      call.write(request);
      if (++count > 3) {
        clearInterval(intervalID);
        call.end();
      }
    }, 1000);
}

async function callMessageToEveryone() {
  const request = {
    user: {
      first_name: 'Borna',
      last_name: 'Nematzadeh',
    },
  };

  const call = client.messageToEveryone(request, (_, response) => {
    console.log(`Server Response: ${ response}`);
  });

  call.on('data', response => {
    console.log(`Hello Client!${ response.result}`);
  });

  call.on('error', error => {
    console.error(error);
  });

  call.on('end', () => {
    console.log('Client The End');
  });

  for (let i = 0; i < 10; i++) {
    call.write(request);
    await sleep(1000);
  }

  call.end();
}

function main(){
  // getUserInfo()
  // callGetManyUsers()
  // callLongMessage()
  callMessageToEveryone();
}

main();