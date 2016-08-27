var sensorReadingsQuery = 'select top 25 C_SENSOR,C_VALUE,C_TIMESTAMP, ' +
                          'ADD_SECONDS(TO_TIMESTAMP(\'1970-01-01 00:00:00\'),C_TIMESTAMP) as TIMESTAMP_STRING ' +
                         'from "NEO_2OTHEHQEZ56TA7WS5J4OSXXB7"."T_IOT_A92B7A64DE865503B6DD" ' +
                         'where C_SENSOR = \'temperature\' ' +
                         'order by C_TIMESTAMP desc';

function getAverageValuesByHourQuery__(sinceHours) {
    var sinceHoursInSeconds = sinceHours * 3600;
    var nowInSecondsSql = 'SECONDS_BETWEEN(TO_TIMESTAMP(\'1970-01-01 00:00:00\'),NOW())';
    var sinceCondSql = '(C_TIMESTAMP > (' + nowInSecondsSql + ' - ' + sinceHoursInSeconds + '))';
    var innerSelect = '(SELECT T.C_VALUE AS TVALUE, H.C_VALUE AS HVALUE, T.C_TIMESTAMP as C_TIMESTAMP ' +
                'FROM (SELECT C_SENSOR,C_TIMESTAMP,C_VALUE FROM "NEO_2OTHEHQEZ56TA7WS5J4OSXXB7"."T_IOT_A92B7A64DE865503B6DD" WHERE C_VALUE != \'nan\' AND C_SENSOR = \'temperature\') AS T ' +
                'JOIN (SELECT C_SENSOR,C_TIMESTAMP,C_VALUE FROM "NEO_2OTHEHQEZ56TA7WS5J4OSXXB7"."T_IOT_A92B7A64DE865503B6DD" WHERE C_VALUE != \'nan\' AND C_SENSOR = \'humidity\') AS H ' +
                'ON T.C_TIMESTAMP = H.C_TIMESTAMP) WHERE ' + sinceCondSql + '';
    var averageValuesByHourQuery = 'Select AVG(TEMP_VALUE) AS TVALUE, AVG(HUM_VALUE) AS HVALUE, HOUR from ' +
                                '(Select TEMP_VALUE,HUM_VALUE,HOUR(TS) as HOUR from (SELECT ' +
                            	'C_TIMESTAMP,ADD_SECONDS(TO_DATE(\'1970-01-01 00:00:00\'),C_TIMESTAMP) as TS, ' +
                            	'TO_DOUBLE(TVALUE) as TEMP_VALUE, ' +
                            	'TO_DOUBLE(HVALUE) as HUM_VALUE ' +
                                'FROM ' + innerSelect + ') ORDER BY TS) ' +
                                'GROUP BY HOUR';// ORDER BY HOUR ASC';
    return averageValuesByHourQuery;
}


/**
 * this function initializes the system with the view and function definition used in the query
 */
function initSQL() {
    var sqls = [];
    sqls.push('DROP VIEW "_SYS_BIC"."TEMP_HUM_READINGS"');
    sqls.push('CREATE VIEW "_SYS_BIC"."TEMP_HUM_READINGS" AS ' +
    'SELECT T.c_value AS tvalue, H.c_value AS hvalue, T.c_timestamp as timestamp FROM ' +
    '(SELECT c_sensor,c_timestamp,c_value ' +
    'FROM "NEO_2OTHEHQEZ56TA7WS5J4OSXXB7"."T_IOT_A92B7A64DE865503B6DD" ' +
    'WHERE c_sensor = \'temperature\') AS T ' +
    'JOIN ' +
    '(SELECT c_sensor,c_timestamp,c_value ' +
    'FROM "NEO_2OTHEHQEZ56TA7WS5J4OSXXB7"."T_IOT_A92B7A64DE865503B6DD" ' +
    'WHERE c_sensor = \'humidity\') AS H ' +
    'ON T.C_TIMESTAMP = H.C_TIMESTAMP');
    sqls.push('DROP FUNCTION "_SYS_BIC"."SENSOR_VALUES_SINCE_HOURS"');
    sqls.push('CREATE FUNCTION "_SYS_BIC"."SENSOR_VALUES_SINCE_HOURS" (sinceHours INT) ' +
    'RETURNS TABLE (TEMP_VALUE DOUBLE, HUM_VALUE DOUBLE, TS TIMESTAMP) ' +
    'LANGUAGE SQLSCRIPT ' +
    'AS ' +
    '  timeNowInSeconds INT; ' +
    '  sinceSeconds INT; ' +
    'BEGIN ' +
    '  timeNowInSeconds := SECONDS_BETWEEN(TO_TIMESTAMP(\'1970-01-01 00:00:00\'),NOW()); ' +
    '  sinceSeconds := :sinceHours * 3600; ' +
    '  RETURN  ' +
    '  SELECT TO_DOUBLE(TVALUE) AS TEMP_VALUE, ' +
    '         TO_DOUBLE(HVALUE) AS HUM_VALUE, ' +
    '         ADD_SECONDS(TO_DATE(\'1970-01-01 00:00:00\'),TIMESTAMP) as TS ' +
    '  FROM "_SYS_BIC"."TEMP_HUM_READINGS" ' +
    '  WHERE TVALUE != \'nan\' AND HVALUE != \'nan\' ' +
    '        AND TIMESTAMP > (:timeNowInSeconds - :sinceSeconds); ' +
    'END');
    for(var i = 0; i < sqls.length; i++) {
        var sql = sqls[i];
        var connection = $.db.getConnection();  
        var statement = null;  
        try{  
            statement = connection.prepareStatement(sql);  
            statement.executeQuery()
        } catch (e) {
            $.trace.debug("error executing query #" + i + ": " + e);
        } finally {  
            close([statement, connection]);  
        }  
    }
}

function getAverageValuesByHourQuery(sinceHours) {
    var query = '' +
    'SELECT AVG(TEMP_VALUE) AS TVALUE, AVG(HUM_VALUE) AS HVALUE, HOUR FROM ' + 
    '(SELECT TEMP_VALUE,HUM_VALUE,HOUR(TS) AS HOUR ' + 
    'FROM "_SYS_BIC"."SENSOR_VALUES_SINCE_HOURS"(' + sinceHours + ') ORDER BY TS) ' +
    'GROUP BY HOUR';
    return query;
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
function getSensorReadings(){  
          var sensorReadingsList = [];  
          var connection = $.db.getConnection();  
          var statement = null;  
          var resultSet = null;  
          try{  
                    statement = connection.prepareStatement(sensorReadingsQuery);  
                    resultSet = statement.executeQuery();  
                    var sensorReading;  
                    var cnt = 0;
                    while (resultSet.next()) {  
                              sensorReading = {};
                              sensorReading.sensor = resultSet.getString(1);  
                              sensorReading.value = resultSet.getString(2);  
                              sensorReading.timestamp = resultSet.getDecimal(3);
                              sensorReading.timestamp_string = resultSet.getString(4)
                              sensorReading.count = cnt++;
                              sensorReadingsList.push(sensorReading);  
                    }  
          } finally {  
                    close([resultSet, statement, connection]);  
          }  
          return sensorReadingsList;  
}

function getAverageSensorReadings(sinceHoursIn){  
          var sensorReadingsList = [];  
          var connection = $.db.getConnection();  
          var statement = null;  
          var resultSet = null;
          var sinceHours = Number(sinceHoursIn) ? Number(sinceHoursIn) : 24;
          try{  
                    statement = connection.prepareStatement(getAverageValuesByHourQuery__(sinceHours));  
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


function doGet() {  
          try{
                    var skipInit = $.request.parameters.get("skipinit");
                    if (skipInit !== "true") {
                        //initSQL();
                    }
                    var sinceHours = $.request.parameters.get("sincehours");
                    $.response.contentType = "application/json";  
                    $.response.setBody(JSON.stringify(getAverageSensorReadings(sinceHours)));  

          }  
          catch(err){  
                    $.response.contentType = "text/plain";  
                    $.response.setBody("Error while executing query: [" + err.message + "]");  
                    $.response.returnCode = 200;  
          }  
}  
doGet();  
 