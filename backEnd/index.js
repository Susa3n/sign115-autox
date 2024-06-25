  require('dotenv').config({ // 读取环境变量
    path: `.env.${process.env.NODE_ENV}`
  });
  const toolDD = require('./tool/dingding.js');
  const express = require('express');
  var bodyParser = require('body-parser');
  const app = express();
  app.use(bodyParser.json());

  console.log(process.env.SERVER_IP);
  console.log(process.env.SERVER_PORT);
  app.get('/', (req, res) => {
    console.log("拦截...");
    res.json({
      code: 0,
      "msg": "success"
    });
  });

  app.post('/115sign/dd/notify', (req, res) => {
    req.body.accessToken = process.env.DINGDING_ACCESSTOKEN; // 钉钉配置信息
    req.body.secret = process.env.DINGDING_SECRET; // 钉钉配置信息
    toolDD.notifyMsg(req.body).then(result => {
      res.json(result)
    }).catch(err => {})
  });


  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running at http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}`, )
  })