importClass(android.content.Context);
importClass(android.provider.Settings);
let OneOneFiveConf = storages.create("OneOneFive-Conf");
let swipeConfName = device.getAndroidId() + "_SWIPE_TIME";
const w = device.width;
const h = device.height;

const oneOnePassword = "susan520"; // 115密码
const unlockPhonePassword = "0310"; // 解锁屏密码
const maxSwipeNum = 3;
const BASE_URL = "http://192.168.4.168:9009/"; // 钉钉机器人服务地址

// 退出脚本
function exitScript() {
  exit();
}
// 获取当前时间，默认格式: 2021/09/18 14:00:00
// rule:
// 1: 格式: 2021/09/18
// 2: 格式: 2021-09-18
function getDateTime(rule) {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();

  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute
  }
  if (second < 10) {
    second = "0" + second;
  }

  switch (rule) {
    case 1:
      return year + "/" + month + "/" + day
    case 2:
      return year + "-" + month + "-" + day
    default:
      return "susa3n  " + year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
  }
}

// // 监听退出脚本函数
function onExit() {
  events.on('exit', function () {
    //    1. 发送钉钉消息
    log('结束脚本运行');
  });
}

function swipeUp() {
  if (OneOneFiveConf.contains(swipeConfName)) {
    let swipeTime = OneOneFiveConf.get(swipeConfName);
    gesture(swipeTime, [w / 2, h * 0.7], [w / 2, h * 0.1]);
    sleep(1000);
    log("滑屏结束，判断是否在解锁页")
    if (judgeSwipeUpResults()) {
      return;
    }
  }
  if (swipeUpOperation()) {
    log("上滑成功");
  } else {
    toastLog("当前程序无法上滑至桌面或密码输入界面");
    exitScript();
  }
}
// 划屏操作
function swipeUpOperation() {
  let swipeTime = 250;
  let addTime = 20;
  for (let i = 0; i < maxSwipeNum; i++) {
    swipeTime += addTime;
    // 滑屏操作
    gesture(swipeTime, [w / 2, h * 0.7], [w / 2, h * 0.1]);
    sleep(1000);
    if (judgeSwipeUpResults()) {
      OneOneFiveConf.put(swipeConfName, swipeTime);
      return true;
    }
  }
  return false;
}


// 判断向上滑动结果
function judgeSwipeUpResults() {
  // 获取系统服务（键盘锁）
  let km = context.getSystemService(Context.KEYGUARD_SERVICE);
  // 判断是否在锁屏界面
  // km.isKeyguardLocked() 返回是否还在锁屏页
  if (!km.isKeyguardLocked()) {
    return true;
  }
  // 这里也再次在判断是否在解锁页
  for (let i = 0; i < 10; i++) {
    if (!text(i).exists() && !desc(i).exists()) {
      return false;
    }
  }
  return true;
}

// 解锁屏幕
function unlockScreen() {
  // 唤醒屏幕
  device.wakeUpIfNeeded();
  // 检查手机锁屏状态
  function screenLockedStatus() {
    let km = context.getSystemService(Context.KEYGUARD_SERVICE);
    return km.isKeyguardLocked() && km.isKeyguardSecure();
  }

  if (!screenLockedStatus()) {
    log("当前屏幕无需解锁");
    swipeUp(); // 上滑操作  无解锁方案
    return;
  }
  swipeUp(); // 解锁输入密码
  sleep(1000);
  // 	如果没有密码返回 解锁完成
  if (unlockPhonePassword) {
    //   有密码去解锁
    passwordToUnlock();
  }
  log("屏幕解锁完成");
}

// 密码解锁
function passwordToUnlock() {
  if (text(0).exists() && text(3).exists() && text(1).exists()) {
    log("unlockPhonePassword", unlockPhonePassword)
    for (let i = 0; i < unlockPhonePassword.length; i++) {
      log(unlockPhonePassword.charAt(i))
      click(unlockPhonePassword.charAt(i))
      sleep(100);
    }
  } else if (desc(0).exists() && desc(3).exists() && desc(1).exists()) {
    for (let i = 0; i < unlockPhonePassword.length; i++) {
      click(unlockPhonePassword.charAt(i))
      sleep(200);
    }
  } else {
    sendNotifyAndExitScript("屏幕解锁失败");
  }
}



// 根据类选择器，检查点击按钮
function checkClickClassName(xyClassName) {
  // 获取登录按钮坐标
  log("android.widget." + xyClassName, className("android.widget." + xyClassName).clickable(true).exists())
  if (className("android.widget." + xyClassName).clickable(true).exists()) {
    className("android.widget." + xyClassName).clickable(true).findOne().click()
  } else {
    toastLog("找不到按钮，请联系脚本作者!");
  }
}

function login() {
  // 1. 勾选阅读协议
  checkClickClassName("CheckBox");
  //   2. 输入密码
  if (!id("login_password_layout").exists()) {
    log("使用id输入")
    id("login_password_layout").findOne().setText(oneOnePassword);
  } else {
    log("使用setText输入");
    setText(0, oneOnePassword);
  }
  //   3. 点击登录
  checkClickClassName("Button");

  //   log(id("cb-agreement_tip").clickable(true).exists(),"111")
  // 	if(id("cb-agreement_tip").clickable(true).exists()){
  //   	id("cb-agreement_tip").clickable(true).findOne().click()
  //     log(111)
  //   }

}

// 根据页面进行操作
function execByPage(page) {
  switch (page) {
    case "login":
      login()
      break
    case "update": // 检查是更新页，执行返回首页
      checkClickClassName("ImageButton");
      break
    case "home": // 检查是主页，执行打开个人页
      click(w / 1.75, h * 0.95);
      break
    case "profile": // 检查是个人页，执行打开签到页
      click(w * 0.1, h * 0.05);
      break
    case "sign": // 检查是签到页，点击签到
      click(w * 0.5, h * 0.6);
      break
    case "signFinish": // 签到完成 退出115
      postDDNotify(getDateTime() + " 签到完成！")
      quitLastApp("115")
      break
    case "reSign": // 已签到 退出115
      postDDNotify(getDateTime() + " 签到完成！")
      quitLastApp("115")
      break
    default:
      postDDNotify(getDateTime() + " 页面识别失败，尝试重新打开软件");
      toastLog("界面识别失败，尝试重新打开钉钉");
  }
  if (page == "signFinish" || page == "reSign") {
    return
  } else {
    execByPage(loopWaitingForPage())
  }
}

// 截屏识别函数返回文字内容
function captureScreenReText() {
  const img = captureScreen();
  const res = paddle.ocrText(img);
  return res
}
// 打开打卡页面
function openOneOneFiveSoftware() {
  // 1. 打开软件
  app.launch("com.ylmf.androidclient")
  app.launchApp("115")
  sleep(3000)
  waitForPackage("com.ylmf.androidclient") // 等待程序打开界面继续执行
  // 2. 判断当前页面
  execByPage(loopWaitingForPage())
}



// 等待进入115界面
function loopWaitingForPage() {
  var delayTime = 1000;
  var content = "";
  for (let index = 0; index < 10; index++) {
    sleep(delayTime += index * 20);
    content = captureScreenReText()
    if (text("更新版本").exists() || desc("更新版本").exists()) {
      return "update";
    } else if (content.includes("签到成功")) {
      return "signFinish"
    } else if (content.includes("115隐私政策")) {
      return "login"
    } else if ((text("存储").exists() || desc("存储").exists()) && (text("社交").exists() || desc("社交").exists()) && (text("生活").exists() || desc("生活").exists())) {
      if (content.includes("微信")) {
        return "home"
      } else if (content.includes("江湖")) {
        return "contact"
      } else if (content.includes("编辑")) {
        return "profile"
      } else {
        return "home"
      }
    } else if (content.includes("明天再来吧")) {
      return "signFinish"
    } else if (content.includes("已签到")) {
      return "reSign"
    } else if (content.includes("签到")) {
      return "sign"
    } else {
      //         发送钉钉通知消息
      log("未识别到页面...")
      sendNotifyAndExitScript("未识别到页面...");
    }
  }
  toastLog("页面卡死，尝试重新打开应用");
  tryToRestart();
}

// 尝试重开
function tryToRestart() {
  openOneOneFiveSoftware();
  exitScript();
}


// 检查权限
function CheckPermissions() {
  // 检查无障碍权限
  if (auto.service == null) {
    toastLog("请先打开无障碍服务，再来运行脚本吧！");
    sleep(3000);
    //     三秒后开打无障碍服务
    app.startActivity({
      action: "android.settings.ACCESSIBILITY_SETTINGS"
    });
    //     退出脚本服务
    exitScript();
  } else {
    log("已开启无障碍服务...")
  }
  //  	1. 打开app，申请录屏权限。解决bug：在hamibot软件外首次运行requestScreenCapture函数脚本卡住，二次运行没问题
  sleep(2000)
  //   2. 开启异步线程，确认录屏权限
  threads.start(function () {
    let index = 0
    let timer = setInterval(function () {
      if (text("立即开始").clickable(true).exists()) {
        text("立即开始").clickable(true).findOne().click();
        clearInterval(timer);
      } else if (desc("立即开始").clickable(true).exists()) {
        desc("立即开始").clickable(true).findOne().click();
        clearInterval(timer);
      }
    }, 800)
  });

  //   3. 请求录屏权限
  if (!requestScreenCapture()) {
    console.warn("未确认录屏权限")
    postDDNotify("未确认录屏权限，请确认权限后再次运行脚本!")
  } else {
    console.info("确认录屏权限")
  }
  //   4.检查完毕
  console.info("录屏权限检查完毕")



}

function testKeyFunction() {
  // powerDialog() // 长按电源键
  // notifications() // 下拉菜单
  // quickSettings() // 下拉菜单
  // recents() // 显示最近任务
  // recents() // 显示最近任务
  // takeScreenshot() // 截图
  // lockScreen() // 锁屏
  // dismissNotificationShade()  // 隐藏通知栏
}

// 退出最后一个应用并传入应用名称
function quitLastApp(name) {
  let swipeTime = 300;
  if (recents()) {
    for (let i = 0; i < 50; i++) {
      swipeTime += 20;
      sleep(2000)
      // 检查是否该应用是否运行中
      if (text(name).exists()) {
        log(name + "应用程序运行中")
      }
      // 滑屏退出应用操作
      gesture(swipeTime, [w * 0.4, h * 0.65], [w * 0, h * 0.65]);
      sleep(1000)
      back() // 返回上一页
      sleep(1000)
      return
    }
  }
}

// 检查程序是否运行在后台
function checkAppRunning(name) {
  if (recents()) {
    sleep(1000)
    if (text(name).exists()) {
      log("115正在运行");
      back()
      sleep(1000)
      return true
    }
    log("115已退出")
    back()
  }
  return false
}

function testHttp() {
  var r = http.get("www.baidu.com");
  log("code = " + r.statusCode);
  log("html = " + r.body.string());
}

function requestInstance(config, callback) {
  let url = BASE_URL
  if (config.url != undefined) {
    url += config.url
  }
  log(url)
  return http.request(url, {
    method: config.method,
    contentType: config.contentType ? config.contentType : "application/json",
    data: config.body
  }, callback)
}


// 钉钉发送通知消息
function postDDNotify(msg) {
  var url = BASE_URL + "115sign/dd/notify";
  r = http.postJson(url, {
    msg: msg
  });
  return JSON.parse(r.body.string())
}
// 程序入口
(function () {
  onExit()

  // 1. 解锁屏幕
  unlockScreen();
  //  2. 检查权限
  CheckPermissions();
  // 3. 进入115页面
  openOneOneFiveSoftware();

  // 5. 检查程序是否运行在后台
  if (checkAppRunning("115")) {
    while (true) {
      quitLastApp("115");
      if (!checkAppRunning("115")) {
        log("115已退出");
        break;
      }
    }
  } else {
    sleep(1000);
    home();
    // 锁屏
    lockScreen()
    sleep(1000);
  }
  // 6. 结束程序
  exitScript();

})()