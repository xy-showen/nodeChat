var http=require("http");
var url=require("url");
var socket_io=require("socket.io");
var hand_mysql=require("./DB/handle_mongodb");

function start(route,handle)
{

     process.on('uncaughtException', function (err) {  //进程捕获异常
       logger.error('Caught exception: ' + err);
     });

hand_mysql.connect_mongoDB();  //db connect

var i=0;

var ser=http.createServer(function(request,response)  //默认监听request事件
{
  var pathName=url.parse(request.url).pathname;

  logger.debug("Request for "+request.url+" received. "+ (++i));
  route(handle, pathName, response, request);
}).listen(4567);

//http.globalAgent.maxSockets = 10;
ser.on("connection",function(socket)//监听各种server事件，connection、close、checkContinue、upgrade、clientError
{

});



soceketIO=socket_io.listen(ser
   //,{
   //transports: ['xhr-polling'],
   // transportOptions: {
   //   'xhr-polling': {duration: 3000}
   // }
   //}
   );
//soceketIO.set('transports', ['xhr-polling']);

//soceketIO.of('/chatsocket');
// if(process.env.VMC_APP_PORT) {
//     soceketIO.set('transports', [


//         'websocket',
//         'flashsocket',
//         'htmlfile',
//  'xhr-polling',

//      'jsonp-polling'
//     ]);
// }


//soceketIO.set('log level', 0);
var socketConns = {};  
soceketIO.setMaxListeners(0);//不限制监听最大数
//sessionSockets.on('connection', function (err, soceketIO, session) {
  soceketIO.sockets.on("connection",function(socket)
  {

    socket.setMaxListeners(0);//不限制监听最大数
    socket.volatile.emit("who",{msg:""});
    var clientSocket=new Object();
    socket.on("verify",function(data)
    {

      clientSocket.soct=socket;
      clientSocket.nickname=data.nickname;
      clientSocket.uid=data.uid;
      clientSocket.username=data.username;
          //var socID=socket.id;
          socketConns[socket.id]=clientSocket;
        for(var socId in socketConns)     //广播效果
        {
          if(socId===socket.id)
            { var userlist="[";
          for(var socId in socketConns)
          {
            var oneuser="{nickname:"+"\""+socketConns[socId].nickname+"\""+",username:"+"\""+socketConns[socId].username+"\""+",uid:"+"\""+socketConns[socId].uid+"\""+"},";
            userlist=userlist+oneuser;
          }
          userlist=userlist.substr(0,userlist.length-1);
          userlist=userlist+"]";
                socketConns[socId].soct.volatile.emit("userlist",{userlist:userlist});//发送聊天室列表
              }
              else
              {
                  socketConns[socId].soct.volatile.emit("new user",{msg:data.nickname+"加入聊天室!",nickname:socketConns[socket.id].nickname,uid:socketConns[socket.id].uid,username:socketConns[socket.id].username});  //volatile指可丢弃的数据
                }
              }

         hand_mysql.updateUserOnline(data.username,1);//设置数据库用户在线

       });

socket.on("disconnect", function () {

  var leaveName=socketConns[socket.id].nickname;
  var leaveNameUid=socketConns[socket.id].uid;
  var leaveUsername=socketConns[socket.id].username;
  delete socketConns[socket.id];  
  for(var socId in socketConns) {  
    socketConns[socId].soct.volatile.emit("userdisconnect", {msg:leaveName+"已经离开聊天室！",uid:leaveNameUid});  
  } 
  hand_mysql.updateUserOnline(leaveUsername,0); 
});

socket.on("msg",function(data)
{
  logger.debug("Get a msg from client...");
    for(var socId in socketConns)     //广播效果
    {
     if(socId!=socket.id)
      socketConns[socId].soct.volatile.emit("user message",data);
  }
		//socket.broadcast.emit("user message",data);  //
	});


});
//});



logger.info("OS:"+process.env.OS);
logger.info("node version:"+process.versions.node);//JSON.stringify(process.versions)
logger.info('runing and listening on port 4567...');
}

exports.start=start;