importClass(android.content.Context);
importClass(android.provider.Settings);
let OneOneFiveConf = storages.create("OneOneFive-Conf");
let swipeConfName = device.getAndroidId() + "_SWIPE_TIME";
const w = device.width;
const h = device.height;

const oneOnePassword = "susan520"
const unlockPhonePassword = "0310"
const maxSwipeNum = 3


// 退出脚本
function exitScript() {
  exit();
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

// 划屏进入控制台中心,移除第一个应用，返回首页
function swipeUpControlCenter() {
  let swipeTime = 500;
  let addTime = 20;
  for (let i = 0; i < maxSwipeNum; i++) {
    swipeTime += addTime;
    console.info(swipeTime, h * 0.99)
    // 滑屏操作
    gesture(swipeTime, [w / 2, h * 0.99], [w / 2, h * 0.87]);
    sleep(1000);
    // if (judgeSwipeUpResults()) {
    //   OneOneFiveConf.put(swipeConfName, swipeTime);
    //   return true;
    // }
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
      killApp("115")
      break
    case "reSign": // 已签到 退出115
      console.info("reSign kill 115")
      killApp("115")
      break
    default:
      toastLog("界面识别失败，尝试重新打开钉钉");
  }
  if (page == "signFinish" || page == "reSign") {
    return
  } else {
    let pageName = loopWaitingForPage()
    console.info("pageName：", pageName)
    execByPage(pageName)
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
  launchApp("115")
  //    waitForPackage("com.ylmf.androidclient") // 等待程序打开界面继续执行
  console.hide()
  sleep(2000)
  // 2. 判断当前页面
  let pageName = loopWaitingForPage()
  console.info("pageName：", pageName)
  execByPage(pageName)
}



// 等待进入115界面
function loopWaitingForPage() {
  var delayTime = 1000;
  var content = "";
  for (let index = 0; index < 10; index++) {
    sleep(delayTime += index * 20);
    console.log("等待识别屏幕中：", index, delayTime);
    content = captureScreenReText()
    console.log(content);
    if (text("更新版本").exists() || desc("更新版本").exists()) {
      return "update";
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
        log("未识别页面")
        //         发送钉钉通知消息
        return
      }
    } else if (content.includes("明天再来吧")) {
      return "signFinish"
    } else if (content.includes("已签到")) {
      return "reSign"
    } else if (content.includes("签到")) {
      return "sign"
    } else {
      //         发送钉钉通知消息
      log("未识别")
    }
  }
  killApp("115");
  toastLog("页面卡死，尝试重新打开应用");
  tryToRestart();
}
// 尝试重开
function tryToRestart() {
  openOneOneFiveSoftware();
  exitScript();
}
// 杀掉应用
function killApp(name) {
  var packageName = app.getPackageName(name);
  console.info(packageName)
  var setting = app.openAppSetting(packageName);
  console.info("setting:", setting)
  sleep(1000);
  while (true) {
    if (text("结束运行").exists()) {
      click("结束运行");
      sleep(500);
      while (true) {
        if (text("确定").exists()) {
          click("确定");
          sleep(500)
          break;
        }
      }
      break;
    } else if (text("强行停止").exists()) {
      click("强行停止");
      sleep(500);
      while (true) {
        if (text("确定").exists()) {
          click("确定");
          sleep(500)
          break;
        }
      }
      break;
    } else {
      setInterval(function () {
        log("打开设置失败...")
      }, 2000)
    }
  }
  back(); // 返回上一个界面
  home(); // 返回首页
}


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
  } else {
    console.info("确认录屏权限")
  }
  //   4.检查完毕
  console.info("录屏权限检查完毕")



}

function testKeyFunction() {
  // powerDialog() // 长按电源键
  // sleep(2000)
  // back()
  // sleep(2000)
  // notifications() // 下拉菜单
  // sleep(2000)
  // back()
  // sleep(2000)
  quickSettings() // 下拉菜单
  // sleep(2000)
  // back()
  // sleep(2000)
  // recents() // 显示最近任务
  // sleep(2000)
  // back()
  // sleep(2000)
  // takeScreenshot() // 截图
  lockScreen() // 锁屏






}

// 程序入口
(function () {
  // console.show()
  onExit()

  testKeyFunction()
  // 	killApp(115)
  // 1. 解锁屏幕
  // unlockScreen();

  // //  2. 检查权限
  // CheckPermissions();
  // 3. 进入115页面
  // openOneOneFiveSoftware();
  // 	testToastMsg()

  // 6. 结束程序
  exitScript();

})()