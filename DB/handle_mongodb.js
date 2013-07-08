var fs=require("fs");
var mustache = require('mustache');
var mongodb = require('mongodb');
//var config = require('config');

var My_mongodb;//连接实例


function connect_mongoDB()
{
  My_mongodb=new mongodb.Db(global.config.mongoDB.mongo_database,new mongodb.Server(global.config.mongoDB.mongo_address,global.config.mongoDB.mongo_port,{auto_reconnect: true,poolSize: 10}));
  My_mongodb.open(function(err,db_p)
  {

    if(err)
    {
      logger.error("open mongo err!"+err);
      throw err;
    }
    else
    {
      My_mongodb.authenticate(global.config.mongoDB.mongo_user,global.config.mongoDB.mongo_password,function(err,replies)
      {
        if(err)
        {
          logger.error("authenticate mongo err!"+err);
        }
        else
        {
          logger.info("connect mongodb success...");

          My_mongodb.collection("user_list",function(err,collection)
          {
            collection.find().toArray(function(err,results)
            {
              if(err)
              {
                logger.error(err);
              }
              else
              {
                 // console.log(results);
               }

             });
          });

       updateUserOnline("*",0);//初始化在线状态
     }
   });
    }
  });
}

function checkLogin(username,password,VerifyImageCodeKey,VerifyImageCode,response)
{
  response.writeHead(200,{"Content-Type":"text/html;charset:UTF-8"}); 

  My_mongodb.collection("user_imageVerifyCode",function(err,collection)
  {
    collection.find({"Guid":VerifyImageCodeKey}).toArray(function(err,results)//Verify ImageCode
    {
      if(err)
      {
        logger.error("checkLogin err for verify VerifyImageCode.");
      }
      else
      {
        if(results[0].imageCode.toLowerCase()!=VerifyImageCode.toLowerCase())
        {
          response.end("4");
          logger.info("login fail,password is VerifyImageCode");
        }
        else
        {
          My_mongodb.collection("user_list",function(err,collection)//Verify username or password
          {
            collection.find({"username":username}).toArray(function(err,results)
            {
              if(err)
              {
                logger.error("checkLogin err for verify username or password");
              }
              else
              {
                if(results.length>0)
                {
                  if(results[0].password===password&&results[0].isonline===0)
                  {    
                    logger.info("login succ,登陆成功");
                    fs.readFile(global.config.StaticResource+'/StaticResource/html/client.html',
                      function(err, data)
                      {
                        response.end(mustache.to_html(data.toString(), {nickname:results[0].nickname,uid:results[0].uid,username:results[0].username}));
                      });
                  }
                  else if(results[0].password!=password)
                  {
                   response.end("1");//password is wrong
                   logger.info("login fail,password is wrong");
                 }
                 else
                 {
                  response.end("3");//用户已在线
                  logger.info("login fail,user has online");
                }
        }
        else
        {
          response.end("2");//没有此账号
          logger.info("login fail,have no the user");
        }
      }

    });
});
}
}
});
});

}

function updateUserOnline(username,state)
{

 My_mongodb.collection("user_list",function(err,collection)
 {
  if(username=="*")
  {
    collection.update({"isonline":{$ne:0}},{$set:{"isonline":state}},{multi:true},function(err)
    {
      if(err)
      {
        logger.error(err);
      }
      else
      {
        logger.info('updated online\'s state successfully...');
      }

    });

  }
  else
  {
    collection.update({"username":username},{$set:{"isonline":state}},function(err,results)
    {
      if(err)
      {
        logger.error(err);
      }
      else
      {
       logger.info("has updata "+username+" online\'s state...");
     }

   });
  }
});
}

function upsertVerifyImageCode(Guid,imageCode,date)
{
  My_mongodb.collection("user_imageVerifyCode",function(err,collection){
    collection.update({"Guid":Guid},{$set:{"imageCode":imageCode,"date":date}},{upsert:true},function(err)
    {
     if(err)
     {
      logger.error("imageCode:"+imageCode+"date:"+date+" "+err);
    }
    else
    {

    }
  });
  });
}


exports.connect_mongoDB=connect_mongoDB;
exports.checkLogin=checkLogin;
exports.updateUserOnline=updateUserOnline;
exports.upsertVerifyImageCode=upsertVerifyImageCode;