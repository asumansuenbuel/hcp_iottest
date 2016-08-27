


sap.ui.jsview("views.SensorReadings", {  
      getHourlyDataset : function() {
                    return new sap.viz.ui5.data.FlattenedDataset({  
                                        // a Bar Chart requires exactly one dimension (x-axis)  
                                        dimensions : [ {  
                                                  axis : 1, // must be one for the x-axis, 2 for y-axis  
                                                  name : 'Hour',  
                                                  value : {
                                                      path : 'hour',
                                                      formatter : function(h) {
                                                          var lhour = (h + 17) % 24;
                                                          var hstr = "0" + lhour;
                                                          var l = hstr.length;
                                                          return hstr.substr(l-2) + ":00";
                                                      }
                                                  }
                                        }],  
                                        // it can show multiple measures, each results in a new set of bars  
                                        // in a new color  
                                        measures : [  
                                        {  
                                                  name : 'Temperature (C)', // 'name' is used as label in the Legend  
                                                  value : { path : 'tvalue', formatter : function(v) { return v; } }
                                        },
                                        {
                                            name : 'Humidity (%)',
                                            value : '{hvalue}'
                                        }
                                        ],  
                                        // 'data' is used to bind the whole data collection that is to be  
                                        // displayed in the chart  
                                        data : {  
                                                  path : "/"  
                                        }  
                              })
        },
      getDailyDataset : function() {
                    return new sap.viz.ui5.data.FlattenedDataset({  
                                        // a Bar Chart requires exactly one dimension (x-axis)  
                                        dimensions : [ {  
                                                  axis : 1, // must be one for the x-axis, 2 for y-axis  
                                                  name : 'Date',  
                                                  value : '{date}'
                                        }],  
                                        // it can show multiple measures, each results in a new set of bars  
                                        // in a new color  
                                        measures : [  
                                        {  
                                                  name : 'Temperature (C)', // 'name' is used as label in the Legend  
                                                  value : { path : 'tvalue', formatter : function(v) { return v; } }
                                        },
                                        {
                                            name : 'Humidity (%)',
                                            value : '{hvalue}'
                                        }
                                        ],  
                                        // 'data' is used to bind the whole data collection that is to be  
                                        // displayed in the chart  
                                        data : {  
                                                  path : "/"  
                                        }  
                              })
        },
         /** Specifies the Controller belonging to this View. 
          * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller. 
          * @memberOf views.SensorReadings 
          */  
          getControllerName : function() {  
                    return null;  
          },  
          /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
          * Since the Controller is given to this method, its event handlers can be attached right away. 
          * @memberOf views.SensorReadings
          */  
          createContent : function(oController) {  
                    var sensorReadingsLineChart = new sap.viz.ui5.Column("sensorReadingsLineChart", {  
                              width : "100%",  
                              height : "75%",  
                              xAxis: {  
                                        title: { visible: true, text : "Hour" }
                              },
                              dataLabel : { visible : true, formatString : [["0.0"],["0.0"]],
                                            position : sap.viz.ui5.types.Datalabel_position.outside
                                          },
                              title : {  
                                        visible : true,  
                                        text : 'Hourly Temperature and Humidity Averages for the last 12 hours'  
                              }  
                              ,  
                              interaction: new sap.viz.ui5.types.controller.Interaction(  
                                                                      {  
                                                                                selectability: new sap.viz.ui5.types.controller.Interaction_selectability(  
                                                                                                    {  
                                                                       mode: sap.viz.ui5.types.controller.Interaction_selectability_mode.single  
                                                                })  
                                                                      }),  
                              dataset : latestReadings = this.getHourlyDataset()
                    });  
                    this.sensorModel = new sap.ui.model.json.JSONModel();  
                    this.sensorModel.loadData("services/sensorDataServiceV2.xsjs?sincehours=12");  
                    sensorReadingsLineChart.setModel(this.sensorModel);
                    // sensorReadingsLineChart.setAnimation(new sap.viz.ui5.types.Line_animation({
                    //     dataLoading : true,
                    //     dataUpdating : false,
                    //     resizing : true,
                    // }));
                    this.chart = sensorReadingsLineChart;
                    return sensorReadingsLineChart;  
        },
        // chart refresh on button click on website "Show ... Averages"
        refreshChart : function(sinceHours,mode) {
            var xtitle, chartTitle;
            if (mode === 'daily') {
                xtitle = "Date";
                chartTitle = "Daily Averages";
                this.chart.setDataset(this.getDailyDataset());
            } else {
                if (!Number(sinceHours)) {
                    alert('enter a number in the hours text field');
                    return;
                }
                xtitle = "Hour";
                chartTitle = 'Hourly Temperature and Humidity Averages for the last ' + sinceHours + ' hours';
                this.chart.setDataset(this.getHourlyDataset());
            }
            //console.log(dim0);
            //var sinceHours = 6;
            this.chart.getXAxis().getTitle().setText(xtitle);
            this.chart.setTitle(new sap.viz.ui5.types.Title({ visible: true, text : chartTitle }));
            this.sensorModel.loadData("services/sensorDataServiceV2.xsjs?sincehours=" + sinceHours + '&mode=' + mode);
        }
});  