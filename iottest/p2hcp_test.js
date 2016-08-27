function send() {
    document.getElementById('main').innerHTML = "sending...";
    try {
        var req = new XMLHttpRequest();
        document.getElementById('main').innerHTML = "request created";
        req.onreadystatechange = function() {
            console.log("readyState: " + req.readyState)
    	    if (req.readyState === 4) {
    	        console.log(req.responseText);
    	        document.getElementById('main').innerHTML = req.responseText;
    	    } else {
    	        document.getElementById('main').innerHTML = "an error occurred";
    	    }
        }
        var url = "https://iotmmsi806258trial.hanatrial.ondemand.com/com.sap.iotservices.mms/v1/api/http/push/e071373c-95cd-41cc-ae29-08013948a60e";
        var data = '{"method":"http", "sender":"PushPush", "messageType":"852f6dac7c92f08167bb", "messages":[{"opcode":"led", "operand":"123", "deviceid":"4711abcd"}]}';
        req.open('POST',url,false);
        document.getElementById('main').innerHTML = "request opened";
        req.setRequestHeader("Authorization","Basic aTgwNjI1ODpHZWxjZW8yNA==");
        req.setRequestHeader("Content-Type","application/json;charset=utf-8");
        console.log(req);
        req.send(data);
        //document.getElementById('main').innerHTML = "request sent";
    } catch (e) {
        console.log(e);
        document.getElementById('main').innerHTML = e + '';
    }
}
