var fs = require("fs");
var url=require("url");
var querystring = require("querystring");
var formidable = require("formidable");
var hand_mongodb=require("./DB/handle_mongodb");
var ccap = require('ccap')();
var mustache = require('mustache');
  
function upload(response,request)
{
	logger.debug("Request handler 'upload' was called. ");
  if(request.method.toLowerCase() =='post')
  {

    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
   form.uploadDir="./StaticResource/tmp";//必须设置
  //  form.tmpDir=global.config.ChatServerAddress+"/StaticResource/tmp";//必须设置
  form.keepExtensions = true;


    form.parse(request, function(err, fields, files) {
      if (err) 
        {
          logger.error("upload err:"+err);
          response.end("{\"msg\":\"上传图片失败！\"}");
          return;
        };
    logger.error("uploading "+fields.username);
    fs.renameSync(files.upload.path,"./StaticResource/tmp/"+fields.username+".jpg");

    response.end("{\"msg\":\"上传图片成功！\"}");
  });
  }

}


function show(response, request) {
  logger.debug("Request handler 'show' was called.");

  if(request.method.toLowerCase() =='get')
  {
      var arg = url.parse(request.url).query; //得到请求的参数

      var username=querystring.parse(arg).username;

    fs.readFile(global.config.StaticResource+"/StaticResource/tmp/"+username+".jpg", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
    }


   logger.debug("Request handler 'show' was called.");
}

function login(response,request)
{
  fs.readFile(global.config.StaticResource+"/StaticResource/html/login.html", 'utf-8',function(err,data) {
              if (err) throw err;
              response.writeHead(200, {"Content-Type": "text/html"});
              response.write(data);
              response.end();
            });

// fs.readFile(global.config.StaticResource+'/StaticResource/html/client.html',
//                       function(err, data)
//                       {
//                         response.writeHead(200, {"Content-Type": "text/html"});
//                         response.end(mustache.to_html(data.toString(), {nickname:"showen",uid:"1001",username:"showen"}));
//                       });



  logger.debug("Request handler 'login' was called.");
}

function check(response,request)
{
  if(request.method.toLowerCase() =='get')
  {

  }
  else if(request.method.toLowerCase() =='post')
  {
    var info="";
    request.addListener("data",function(data)
    {
       info+=data;
    });
    request.addListener("end",function()
    {
       logger.debug(info);
       var username=querystring.parse(info).username;
       var password=querystring.parse(info).password;
       var VerifyImageCode=querystring.parse(info).VerifyImageCode;
       var VerifyImageCodeKey=querystring.parse(info).VerifyImageCodeKey;

      hand_mongodb.checkLogin(username,password,VerifyImageCodeKey,VerifyImageCode,response);
    });
  }    
}



function getVerifyImage(response,request)
{
  var arg = url.parse(request.url).query
  var Guid=querystring.parse(arg).Guid;

  var ary = ccap.get();


  var imageCode = ary[0];
  //var imageCode ="0";


  var buf = ary[1];
  //var buf = null;
  var date=new Date();
  hand_mongodb.upsertVerifyImageCode(Guid,imageCode,date);
  response.end(buf);
}

exports.upload=upload;
exports.show = show;
exports.login=login;
exports.check=check;
exports.getVerifyImage=getVerifyImage;
