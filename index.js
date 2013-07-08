var server=require("./server");
var router=require("./router");
var fs=require("fs");
var requestHandlers=require("./requestHandlers");
var log4js = require('log4js'); //{trace debug info warn error fatal}

log4js.configure({
  appenders: [
    { type: 'console' },
    {type:'file',filename:'logs/dail.log'}
  ],
  replaceConsole:true
});

// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('./logs/dail.log'),'filelog');

var handle={};
       fs.readFile('./config.json','utf-8', function (err, data) {
         if (err) throw err;
         else
         {
           global.config=JSON.parse(data);  //定义全局配置文件变量
           global.logger = log4js.getLogger('filelog');  //定义全局日志输出
           //logger.setLevel('ERROR');
           handle["/upload"]=requestHandlers.upload;
           handle["/show"] = requestHandlers.show;

           handle["/login"]=requestHandlers.login;
           handle["/check"] = requestHandlers.check;

           handle["/game"]=requestHandlers.game;
           handle["/getVerifyImage"]=requestHandlers.getVerifyImage;
           server.start(router.route,handle);
         }
       });;


