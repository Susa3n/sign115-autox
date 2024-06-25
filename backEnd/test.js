const toolDD = require('./tool/dingding.js');

// 测试通知接口
function testNotify() {
  const axios = require('axios');
  let data = JSON.stringify({
    accessToken: "45b9360fb60c9e030bf72acdc76d747dcae1ad93778bb72c97e3d7d63fd266fb",
    secret: "SEC03803cceefc29b88afebd4c68977727f2bde32d202e000bcf1640aca2a6322f1",
    msg: "xxx"
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:8083/115sign/dd/notify',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}

// 测试通知函数
function testNotifyMsg(options) {
  toolDD.notifyMsg(options)
}

(function main(params) {
  console.log(process.env.SERVER_IP);
  // testNotify()
  // testNotifyMsg({
  //   accessToken: "45b9360fb60c9e030bf72acdc76d747dcae1ad93778bb72c97e3d7d63fd266fb",
  //   secret: "SEC03803cceefc29b88afebd4c68977727f2bde32d202e000bcf1640aca2a6322f1",
  //   msg: "xxx"
  // })
})()