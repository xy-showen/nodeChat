var fs=require("fs");
var mustache = require('mustache');
var mongodb = require('mongodb');
//var config = require('config');

var My_mongodb;//连接实例

function handleError (err) {
  if (err) {
    // 如果是连接断开，自动重新连接
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      onnect_mysql();
    } else {
      console.log(err.stack || err);
    }
  }
  else
  {
    // conn.query("CREATE TABLE user_list(uid varchar(255),username varchar(255),nickname varchar(255),password varchar(255),isonline int)",function(error,results)
    //        {
    //           if(error)
    //             console.log("创建user_list表出错");
    //        });


    //        conn.query("insert into user_list values('100','xiaoyong','showen','xiao52yong',0),('101','jeson','jeson','123456',0)",function(error,results)
    //        {
    //           if(error)
    //             console.log("创建user_list数据表出错");
    //        });

    //        conn.query("show tables",function(error,results)
    //        {
    //           if(error)
    //           {
    //             console.log("执行数据库有出错："+error.message);
    //             conn.end();
    //           }
    //           console.log(results);
    //       });

    //        conn.query("select * from user_list",function(error,results)
    //        {
    //           if(error)
    //           {
    //             console.log("执行数据库有出错："+error.message);
    //             conn.end();
    //           }
    //           console.log(results);
    //       });

        updateUserOnline("*","0");//初始化在线状态
  }
}


function connect_mongoDB()
 {
  console.log("-=-=-=");
  My_mongodb=new mongodb.Db(global.config.mongoDB.mongo_database,new mongodb.Server(global.config.mongoDB.mongo_address,global.config.mongoDB.mongo_port,{auto_reconnect: true}));
  My_mongodb.open(function(err,db_p)
  {
    console.log("1111");
    if(err)
    {
      console.log("open mongo err!"+err);
      throw err;
    }
    else
    {
      My_mongodb.authenticate(global.config.mongoDB.mongo_user,global.config.mongoDB.mongo_password,function(err,replies)
      {
        if(err)
        {
            console.log("authenticate mongo err!"+err);
        }
        else
        {
          console.log("connect mongodb success");


        My_mongodb.collection("user_list",function(err,collection)
          {
            collection.find().toArray(function(err,results)
              {
                if(err)
                {
                  console.log(err);
                }
                else
                {
                  console.log(results);
                }

              });
          });


       updateUserOnline("*",0);//初始化在线状态
        }
      });
    }
  });
}

function checkLogin(username,password,response)
{
    response.writeHead(200,{"Content-Type":"text/html;charset:UTF-8"}); 

        My_mongodb.collection("user_list",function(err,collection)
          {
            collection.find({"username":username}).toArray(function(err,results)
              {
                if(err)
                {
                  console.log("checkLogin err");
                }
                else
                {
                  if(results.length>0)
                  {
                    if(results[0].password===password&&results[0].isonline===0)
                    {    
                      console.log("login succ,登陆成功");
                      fs.readFile(global.config.StaticResource+'/StaticResource/html/client.html',
                      function(err, data)
                      {
                        response.end(mustache.to_html(data.toString(), {nickname:results[0].nickname,uid:results[0].uid,username:results[0].username}));
                      });
                    }
                    else if(results[0].password!=password)
                      {
                         response.end("1");
                         console.log("login fail,password is wrong");
                      }
                      else
                      {
                         response.end("3");//用户已在线
                         console.log("login fail,user has online");
                      }
                  }
                  else
                  {
                     response.end("2");//没有此账号
                     console.log("login fail,have no the user");
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
                  console.log("sdf");
                  collection.update({"isonline":{$ne:0}},{$set:{"isonline":state}},{multi:true},function(err)
                  {
                    if(err)
                    {
                      console.log("sd123213");
                      console.log(err);
                    }
                    else
                    {
                      console.log('successfully updated....');
                    }

                  });

                }
                else
                {
                  console.log("sdf11");
                  collection.update({"username":username},{$set:{"isonline":state}},function(err,results)
                  {
                    if(err)
                    {
                      console.log(err);
                    }
                    else
                    {
                      console.log(results);
                      console.log("has updata online state");
                    }

                  });
                }
              });
}


exports.connect_mongoDB=connect_mongoDB;
exports.checkLogin=checkLogin;
exports.updateUserOnline=updateUserOnline;