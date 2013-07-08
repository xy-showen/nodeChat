   var socket;
        $.getJSON('../../config.json',function(data){  //得到配置文件对象
           //alert(data.ChatServerAddress);
           var host = window.location.host.split(':')[0];
           //var socket = io.connect(data.ChatServerAddress);
           socket = io.connect();//, {'connect timeout':4000,reconnect:false,'try multiple transports':false});//'connect timeout':30000,


           if(socket)
           {
               document.getElementById('status').innerHTML="在线";
               //alert("online");
           }


          //本地客户断开连接触发的信息
          socket.on('disconnect',function(msg)
          {
            //alert("no online");
             document.getElementById('status').innerHTML="离线";
             var list =  document.getElementById("userlist").getElementsByTagName("li");
              for(var i=0;i<list.length;i++)
              {
                 document.getElementById('uList').removeChild(list[i]);
              }
             
             });
          socket.on('connect',function(msg)
          {
            document.getElementById('status').innerHTML="在线"
          });


			//正式消息
			socket.on('user message', function(msg) {
				var today = new Date();
                var today_year = today.getYear();
                var today_month = today.getMonth();
                var today_date = today.getDate();
                var today_day = today.getDay();
                var today_hour = today.getHours();
                var today_minute = today.getMinutes()
                var today_seconds=today.getSeconds()
                if(today_hour<10)
                	today_hour="0"+today_hour;
                if(today_minute<10)
                	today_minute="0"+today_minute;
                if(today_seconds<10)
                	today_seconds="0"+today_seconds;

                var str=msg.nickname+ " "+today_hour+":"+today_minute+":"+today_seconds+"      said:"+msg.msg;
                msgbox(str);
            });

			// //新客户连接触发的信息
			// socket.on('connected',function(msg)
			//  	{
			//  		msgbox(msg.msg);
			//  	});




			 //其它用户退出
            socket.on('userdisconnect',function(msg)
            {
			 		msgbox(msg.msg);//打印有人离开消息
			 		var removeLi = document.getElementById(msg.uid);//在userlist中移除
                    removeLi.parentNode.removeChild(removeLi);
                });
			 //确认昵称
			 socket.on('who',function(msg)
			 {
               socket.emit('verify', {nickname:document.getElementById('nickname').value,username:document.getElementById('username').value,uid:document.getElementById('uid').value});
           });

			 //读取userlist
			 socket.on('userlist',function(msg)
			 {
			 	//alert(msg.userlist);
			 	var userList=eval("("+msg.userlist+")");//转化成json对象
             　　　　for(var i=0;i<userList.length;i++){ 

                           // oElentment = document.createElement("li");
                           // oTextNode = document.createTextNode(userList[i].nickname);
                           // oElentment.appendChild(oTextNode);
                           // document.getElementById('uList').appendChild(oElentment);

                           var len = document.getElementById('uList').innerHTML+='<li id='+userList[i].uid+' title='+userList[i].username+'>'+userList[i].nickname+'</li>';

                       　　                 }
                       addShowFriendsImgEvent('*');//userList.js中显示好友头像的方法

                   });

             //打印新连接客户信息
             socket.on('new user',function(msg)
             {
              msgbox(msg.msg);
              document.getElementById('uList').innerHTML+='<li id='+msg.uid+' title='+msg.username+'>'+msg.nickname+'</li>';
              addShowFriendsImgEvent('*');
          });
         });

             //发送消息
             var lastTime=0;
             function sendMsg() {
                var inpt = document.getElementById('txtInput');
                var str = inpt.value;
                if(str.length==0){
                   inpt.className="error";
                   alert("请输入发送的消息内容");
                   return false;
               }
               var nickName=document.getElementById('nickname').value;


               var today = new Date();
               var today_year = today.getYear();
               var today_month = today.getMonth();
               var today_date = today.getDate();
               var today_day = today.getDay();
               var today_hour = today.getHours();
               var today_minute = today.getMinutes()
               var today_seconds=today.getSeconds()
               if(today_hour<10)
                   today_hour="0"+today_hour;
               if(today_minute<10)
                   today_minute="0"+today_minute;
               if(today_seconds<10)
                   today_seconds="0"+today_seconds;

               var str=nickName+ " "+today_hour+":"+today_minute+":"+today_seconds+"      said:"+str;

               if(today.getTime()-lastTime<1000&&lastTime!=0)
               {
                  alert("请放慢语速！")
                  return;
              }
              else
              {
                  lastTime=today.getTime();
              }

				//发送消息至服务器的Scoket。
				socket.emit('msg', {
					msg : inpt.value,nickname:nickName
				});


                inpt.className = "";
				msgbox(str);//本地显示
				
				console.log('[client]' + str);
				inpt.value = "";
				inpt.focus();
			}

			function msgbox(str) {
				var box = document.getElementById('box');
				box.innerHTML += str + '<br>';
				document.getElementById("box").scrollTop= document.getElementById("box").scrollHeight;
			}
			
			$(document).ready(function()
            {
               document.body.onkeypress = function(event){
                   var e = window.event || event;
                   if(e.keyCode==13){
                      sendMsg();
                  }
              }
          });