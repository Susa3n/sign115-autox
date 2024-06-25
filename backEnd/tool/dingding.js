const ChatBot = require('dingtalk-robot-sender');

function notifyMsg({
  accessToken,
  secret,
  msg
}) {
  const robot = new ChatBot({
    baseUrl: 'https://oapi.dingtalk.com/robot/send',
    accessToken,
    secret
  });
  let textContent = {
    "msgtype": "text",
    "text": {
      "content": msg
    },
  }
  return robot.send(textContent).then(({
    statusText,
    status
  }) => {
    return {
      statusText,
      status
    }
  })
}
module.exports = {
  notifyMsg
};