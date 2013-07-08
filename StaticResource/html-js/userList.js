/**
 * New node file
 */

 
 function cre(tag) { 
    return document.createElement(tag);
}

function memberEvent(targtObj, temp) {
    targtObj[temp].onclick = function() {   
        createEle(this.title,this.id);
    }
}

function createEle(stuName, newIdN) {
    var newEle = cre("div");
    newEle.className = "chat";
    newEle.id = "chat" + newIdN;
    newEle.style.position = "absolute";
    
    var newHtt = cre("div");
    newHtt.className = "chat-tt";
    
    var newH2 = cre("h2");
    newH2.innerHTML = stuName;//这是通过参数来获得 好友的名字 先保存在一个参数里，
    newHtt.appendChild(newH2);    
    
    var ttbtn = cre("div"); 
    ttbtn.className = "tt-btn";
    newHtt.appendChild(ttbtn);
    
    var ttbtnCon1 = cre("a");
    ttbtnCon1.className= "a3";
    ttbtn.appendChild(ttbtnCon1);
    
    var ttbtnCon2 = cre("a");
    ttbtnCon2.className = "a4";
    ttbtn.appendChild(ttbtnCon2);
    
    //隐藏聊天窗口
    ttbtnCon1.onclick = function() {   
        displayNone(newEle);
    };  
    
    //关闭聊天窗口  
    ttbtnCon2.onclick = function() {  
        removeEle(newEle);//移除对话窗口
        removeEle(botNav);//移除左下方的状态栏
    };
    
    var chatBox = cre("div");
    chatBox.className = "chatBox";
    
    var sedMessage = cre("div");
    sedMessage.className = "send";
    
    var textarea = cre("textarea");//聊天记录
    textarea.className = "textarea";
    sedMessage.appendChild(textarea);
    
    var sedMsg = cre("input"); //发送消息按钮
    sedMsg.type = "button";
    sedMsg.value = "sendmessage";
    sedMessage.appendChild(sedMsg);
    
    var spanMsg = document.createElement("span");//发送内容空 的小提示
    sedMessage.appendChild(spanMsg);
    
    // 发送消息按钮事件
    sedMsg.onclick = function() {
        var flag = true;
        var chatLogs = cre("p");
        chatBox.appendChild(chatLogs);
        
        //判断发送内容是否为空
        if (isNull(textarea, spanMsg) == true) {
            chatLogs.innerHTML = '<span>我说：</span><br/>' + textarea.value;
        } else {
            removeEle(chatLogs);
        }
        //点击发送后 清空textarea内的值
        textarea.value = "";
    };
    
    newEle.appendChild(newHtt);
    newEle.appendChild(chatBox);
    newEle.appendChild(sedMessage);
    document.body.appendChild(newEle); 

    //创建 左下方的状态栏
    var botNav = cre("div");         
    botNav.className = "chat-nav";

    var botName = cre("h5");
    botName.innerHTML = stuName;

    var closeSpan = cre("span");
    closeSpan.innerHTML = "X";
    
    botNav.appendChild(botName);
    botNav.appendChild(closeSpan);
    
    var parentNodes = $("last");
    parentNodes.appendChild(botNav);
    
}

  //添加鼠标移入移出事件  
  function addShowFriendsImgEvent(user){
    if(user=="*")
    {
          //获取所有li节点  
          var list =  document.getElementById("userlist").getElementsByTagName("li");  
                //遍历所有li节点  
                for(var i=0;i<list.length;i++){  
                    //添加鼠标移入事件  
                    list[i].onmouseover=function(){  
                        mouseX = event.clientX;
                        mouseY = event.clientY;
                        var infoDiv = document.getElementById("Fimg");
                        var info = document.getElementById("s");

                        info.height="100";
                        info.width="100";
                        info.src="show?username="+this.title;
                    //alert(this.title);
                    infoDiv.style.left = mouseX;
                    infoDiv.style.top = mouseY;
                    infoDiv.style.display = "block";

                    this.style.backgroundColor="#ffcc00";  
                    this.style.fontSize="20px";  
                        //document.getElementById("s").src="show?username="+document.getElementById("username").value;
                    }  
                    //添加鼠标移出事件  
                    list[i].onmouseout=function(){  
                        this.style.backgroundColor="#eeeeee";  
                        this.style.fontSize="16px"; 
                        var infoDiv = document.getElementById('Fimg');
                        infoDiv.style.display = "none"; 
                    }
                    


                    memberEvent(list, i);
                    
                    
                }  
            }
            else
            {
              alert(user);
                 //添加鼠标移入事件  
                 document.getElementById(user).onmouseover=function(){  
                    mouseX = event.clientX;
                    mouseY = event.clientY;
                    var infoDiv = document.getElementById("Fimg");
                    var info = document.getElementById("s");
                    //alert(this.title);
                    info.height="100";
                    info.width="100";
                    info.src="show?username="+this.title;
                    infoDiv.style.left = mouseX;
                    infoDiv.style.top = mouseY;
                    infoDiv.style.display = "block";

                    this.style.backgroundColor="#ffcc00";  
                    this.style.fontSize="20px";  
                        //document.getElementById("s").src="show?username="+document.getElementById("username").value;
                    }  
                    //添加鼠标移出事件  
                    document.getElementById(user).onmouseout=function(){  
                        this.style.backgroundColor="#eeeeee";  
                        this.style.fontSize="16px"; 
                        var infoDiv = document.getElementById('Fimg');
                        infoDiv.style.display = "none"; 
                        //alert("-----");
                    }   
                }
            }  