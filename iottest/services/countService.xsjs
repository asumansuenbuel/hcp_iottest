/*
 * simple query returning the number of entries in the sensor readings table
 */
 
 var theQuery = 'SELECT COUNT(*) AS COUNT FROM "I806258"."T_IOT_47D5A5E41FE370C9079F" WHERE C_VALUE != \'nan\'';
 
 function getSensorReadingsCount(){  
          var sensorReadingsList = [];  
          var connection = $.db.getConnection();  
          var statement = null;  
          var resultSet = null;
          try{  
                    statement = connection.prepareStatement(theQuery);  
                    resultSet = statement.executeQuery();  
                    var sensorReading;  
                    while (resultSet.next()) {  
                              sensorReading = {};
                              var col = 1;
                              //sensorReading.sensor = resultSet.getString(col++);  
                              sensorReading.count = resultSet.getDecimal(col++);  
                              sensorReadingsList.push(sensorReading);  
                    }  
          } finally {  
                    close([resultSet, statement, connection]);  
          }  
          return sensorReadingsList;  
}  

function close(closables) {  
          var closable;  
          var i;  
          for (i = 0; i < closables.length; i++) {  
                    closable = closables[i];  
                    if(closable) {  
                              closable.close();  
                    }  
          }  
}  


function doGet() {  
          try{
                    $.response.contentType = "application/json";  
                    $.response.setBody(JSON.stringify(getSensorReadingsCount()));

          }  
          catch(err){  
                    $.response.contentType = "text/html";  
                    $.response.setBody('<table width="100%" height="100%"><tr><td align="left" valign="middle" style="font-size:20pt">' + err.message + '</td></tr></table>');  
                    $.response.returnCode = 200;  
          }  
}  
doGet();  
