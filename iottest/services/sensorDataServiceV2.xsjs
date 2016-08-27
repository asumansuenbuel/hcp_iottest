

function getAverageValuesByHourQuery(sinceHours) {
    var query = '' +
    'SELECT AVG(TEMP_VALUE) AS TVALUE, AVG(HUM_VALUE) AS HVALUE, HOUR FROM ' + 
    '(SELECT TEMP_VALUE,HUM_VALUE,HOUR(TS) AS HOUR ' + 
    'FROM "I806258"."SENSOR_VALUES_SINCE_HOURS"(' + sinceHours + ') ORDER BY TS) ' +
    'GROUP BY HOUR';
    return query;
}

function getAverageValuesByDayQuery_() {
    return 'SELECT AVG(TEMP_VALUE) AS TVALUE,AVG(HUM_VALUE) AS HVALUE,YEAR,MONTH,DAY FROM\n' +
    '(SELECT TEMP_VALUE,HUM_VALUE,YEAR(TS) AS YEAR,MONTH(TS) AS MONTH, DAYOFMONTH(TS) AS DAY\n' +
    'FROM I806258.TEMP_HUM_READINGS_IN_NUMS)\n' +
    'GROUP BY YEAR,MONTH,DAY ORDER BY YEAR,MONTH,DAY';
}

function getAverageValuesByDayQuery() {
    return 'SELECT AVG(TEMP_VALUE) AS TVALUE,AVG(HUM_VALUE) AS HVALUE,YEAR,MONTH,DAY FROM\n' +
    '(SELECT TEMP_VALUE,HUM_VALUE,YEAR(TS) AS YEAR,MONTH(TS) AS MONTH, DAYOFMONTH(TS) AS DAY\n' +
    'FROM "I806258"."SENSOR_VALUES_SINCE_HOURS")\n' +
    'GROUP BY YEAR,MONTH,DAY ORDER BY YEAR,MONTH,DAY';
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

function getHourlyAverageSensorReadings(sinceHoursIn){  
          var sensorReadingsList = [];  
          var connection = $.db.getConnection();  
          var statement = null;  
          var resultSet = null;
          var sinceHours = Number(sinceHoursIn) ? Number(sinceHoursIn) : 24;
          try{  
                    statement = connection.prepareStatement(getAverageValuesByHourQuery(sinceHours));  
                    resultSet = statement.executeQuery();  
                    var sensorReading;  
                    var cnt = 0;
                    while (resultSet.next()) {  
                              sensorReading = {};
                              var col = 1;
                              //sensorReading.sensor = resultSet.getString(col++);  
                              sensorReading.tvalue = resultSet.getDecimal(col++);  
                              sensorReading.hvalue = resultSet.getDecimal(col++);  
                              sensorReading.hour = resultSet.getDecimal(col++);
                              sensorReading.count = cnt++;
                              sensorReadingsList.push(sensorReading);  
                    }  
          } finally {  
                    close([resultSet, statement, connection]);  
          }  
          return sensorReadingsList;  
}  

function formatDate(year,month,day) {
    var addL0 = function(num) {
        return num < 10 ? ('0' + num) : ('' + num);
    };
    return year + '-' + addL0(month) + '-' + addL0(day);
}

function getDailyAverageSensorReadings() {  
          var sensorReadingsList = [];  
          var connection = $.db.getConnection();  
          var statement = null;  
          var resultSet = null;
          try{  
                    statement = connection.prepareStatement(getAverageValuesByDayQuery());  
                    resultSet = statement.executeQuery();  
                    var sensorReading;  
                    while (resultSet.next()) {  
                              sensorReading = {};
                              var col = 1;
                              //sensorReading.sensor = resultSet.getString(col++);  
                              sensorReading.tvalue = resultSet.getDecimal(col++);  
                              sensorReading.hvalue = resultSet.getDecimal(col++);  
                              var year = resultSet.getDecimal(col++);
                              var month = resultSet.getDecimal(col++);
                              var day = resultSet.getDecimal(col++);
                              sensorReading.date = formatDate(year,month,day);
                              sensorReadingsList.push(sensorReading);  
                    }  
          } finally {  
                    close([resultSet, statement, connection]);  
          }  
          return sensorReadingsList;  
}  



function doGet() {  
          try{
                    var mode = $.request.parameters.get("mode");
                    var modeIsDaily = mode === "daily";
                    var sinceHours = $.request.parameters.get("sincehours");
                    $.response.contentType = "application/json";  
                    if (modeIsDaily) {
                        var jsonResponse = JSON.stringify(getDailyAverageSensorReadings());
                        log('bla');
                        $.response.setBody(jsonResponse);
                    } else {
                        $.response.setBody(JSON.stringify(getHourlyAverageSensorReadings(sinceHours)));
                    }
                    //$.response.setBody(JSON.stringify(getDailyAverageSensorReadings()));  

          }  
          catch(err){  
                    $.response.contentType = "text/html";  
                    $.response.setBody('<table width="100%" height="100%"><tr><td align="left" valign="middle" style="font-size:20pt">' + err.message + '</td></tr></table>');  
                    $.response.returnCode = 200;  
          }  
}  
doGet();  
 