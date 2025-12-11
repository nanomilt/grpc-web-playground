const {SearchUserRequest, /* SearchUserResponse, */ UserRequest, UrlRequest, NumRequest} = require('./greet_pb');
const {GreeterClient} = require('./greet_grpc_web_pb');

const client = new GreeterClient('http://localhost:5000');

const searchUserCall = new SearchUserRequest();

document.getElementById('btn').addEventListener('click',()=>{
  searchUserCall.setName(document.getElementById('q').value);

  client.searchUser(searchUserCall, {}, (_, response) => {
    // Fix XSS: Use textContent instead of innerHTML to prevent script execution
    document.getElementById('result').textContent = `Your Search Result: ${response}`;
  });
});

const getUserCall = new UserRequest();
getUserCall.setStatus(true);
client.getUsers(getUserCall, {}, (_, response) => {
  console.log(response);
});


document.getElementById('btn2').addEventListener('click',()=>{
  const getUrlContent = new UrlRequest();
  getUrlContent.setUrl(document.getElementById('qu').value);
  client.addUrl(getUrlContent, {}, (_, response) => {
    // Fix XSS: Use textContent instead of innerHTML to prevent script execution
    document.getElementById('result2').textContent = `URL: ${response}`;
  });
});

document.getElementById('btn3').addEventListener('click',()=>{
  const getSumContent = new NumRequest();
  getSumContent.setNumber(document.getElementById('n').value);
  client.addNum(getSumContent, {}, (_, response) => {
    // Fix XSS: Use textContent instead of innerHTML to prevent script execution
    document.getElementById('result3').textContent = `Sum: ${response}`;
  });
});