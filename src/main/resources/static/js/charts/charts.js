/**
 * 
 */
var app = angular.module('angularChartApp', ['ui.router','chart.js','uiGmapgoogle-maps']);
app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/pie')
    $stateProvider
        .state('bar', {
            url: "/bar",
            views: {
                "main": {
                    controller: 'angularBarChartController',
                    templateUrl: './BarChart.html'
                }
            }
        })
        .state('pie', {
            url: "/pie",
            views: {
                "main": {
                    controller: 'angularPieChartController',
                    templateUrl: './PieChart.html'
                }
            }
        })
        .state('maps', {
            url: "/maps",
            views: {
                "main": {
                    controller: 'SearchBoxController',
                    templateUrl: './MapSearch.html'
                }
            }
        })
});
app.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
	  GoogleMapApi.configure({
	    key: 'AIzaSyBaHcGCCdwRlaqTTS4sPRdqCphZ01EDwCI',
	    v: '3.17',
	    libraries: 'places'
	  });
	}])

	app.run(['$templateCache', function ($templateCache) {
	  $templateCache.put('searchbox.tpl.html', '<input id="pac-input" class="pac-controls" type="text" placeholder="Search">');
	  $templateCache.put('window.tpl.html', '<div ng-controller="WindowCtrl" ng-init="showPlaceDetails(parameter)">{{place.name}}</div>');
	}])

	app.controller('WindowCtrl', function ($scope) {
	  $scope.place = {};
	  $scope.showPlaceDetails = function(param) {
	    $scope.place = param;
	  }
	})

	app.controller("SearchBoxController",['$scope', '$timeout', 'uiGmapLogger', '$http','uiGmapGoogleMapApi'
	    , function ($scope, $timeout, $log, $http, GoogleMapApi) {
		$http.get(url).then(function (response) {
		$log.doLog = true
	  GoogleMapApi.then(function(maps) {
	    maps.visualRefresh = true;
	    $scope.defaultBounds = new google.maps.LatLngBounds(
	      new google.maps.LatLng(20.5937,78.9629),
	      new google.maps.LatLng(20.5937,78.9629));
	    $scope.map.bounds = {
	      northeast: {
	        latitude:$scope.defaultBounds.getNorthEast().lat(),
	        longitude:$scope.defaultBounds.getNorthEast().lng()
	      },
	      southwest: {
	        latitude:$scope.defaultBounds.getSouthWest().lat(),
	        longitude:-$scope.defaultBounds.getSouthWest().lng()
	      }
	    }
	    $scope.searchbox.options.bounds = new google.maps.LatLngBounds($scope.defaultBounds.getNorthEast(), $scope.defaultBounds.getSouthWest());
	  });
	  angular.extend($scope, {
	    window: {
	      show: false,
	      options: {
	        pixelOffset: { width: 0, height: -40 }
	      },
	      templateurl:'window.tpl.html',
	      templateparameter: {},
	      closeClick: function () {
	        $scope.window.show = false;
	      }
	    },
	    map: {
	      control: {},
	      center: {
	        latitude: 20.5937,
	        longitude: 78.9629
	      },
//	      zoom: 15,
	      dragging: false,
	      bounds: {},
	      markers: [],
	      idkey: 'place_id',
	      events: {
	        idle: function (map) {
	                   
	        },
	        dragend: function(map) {
	          //update the search box bounds after dragging the map
	          var bounds = map.getBounds(); alert("------------------------------"+bounds)
	          var ne = bounds.getNorthEast();
	          var sw = bounds.getSouthWest(); 
	          $scope.searchbox.options.bounds = new google.maps.LatLngBounds(sw, ne);
	          //$scope.searchbox.options.visible = true;
	        }
	      }
	    },
	    searchbox: {
	      template: 'searchbox.tpl.html',
	      //position:'top-right',
	      position:'top-left',
	      options: {
	        bounds: {},
	        visible: true
	      },
	      //parentdiv:'searchBoxParent',
	      events: {
	        places_changed: function (searchBox) {
	          places = searchBox.getPlaces()
	          if (places.length == 0) {
	            return;
	          }
	          // For each place, get the icon, place name, and location.
	          newMarkers = [];
	          var bounds = new google.maps.LatLngBounds();
	          alert(bounds)
	          for (var i = 0, place; place = places[i]; i++) {
	            // Create a marker for each place.
	            var marker = {
	              idKey:i,
	              place_id: place.place_id,
	              name: place.name,
	              latitude: place.geometry.location.lat(),
	              longitude: place.geometry.location.lng(),
	              templateurl:'window.tpl.html',
	              templateparameter: place,
	              events: {
	                click: function (marker) {
	                  $scope.window.coords = {
	                    latitude: marker.model.latitude,
	                    longitude: marker.model.longitude
	                  }
	                  $scope.window.templateparameter = marker.model.templateparameter;
	                  $scope.window.show = true;
	                  
	                }
	              }
	            };
	            newMarkers.push(marker);
	            bounds.extend(place.geometry.location);
	          }

	          $scope.map.bounds = {
	            northeast: {
	              latitude: bounds.getNorthEast().lat(),
	              longitude: bounds.getNorthEast().lng()
	            },
	            southwest: {
	              latitude: bounds.getSouthWest().lat(),
	              longitude: bounds.getSouthWest().lng()
	            }
	          }

	          $scope.map.markers = newMarkers;
	        }
	      }
	    }
	   });
		}, function (error) {
            alert("error");
        });
		}]);

app.controller('angularBarChartController', function ($scope, $http, $window) {
	var k=7,d= 0;var diff=4;
	var d = new Date();
	var month =  d.getMonth()+1;
		var day = d.getDate();
	var year = d.getFullYear();
	var day1 =d.getDate()+7;
	$('#startDate').datetimepicker({
		format: 'Y-m-d H:i ',
	});
	
		$('#endDate').datetimepicker({
			format: 'Y-m-d H:i ',
			});
		$scope.startDate =year+"-"+month+"-"+day+" 00:00";
		 if ((year % 100 == 0 && year % 400 == 0) || year % 4 == 0) {
	            Date._MD = new Array(31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	        }
	        else {
	            Date._MD = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	        }
		var days_in_month = Date._MD[month-1];   
		if(day<days_in_month-6){
			day1=d.getDate()+6;
		}
		else{
			if(month==12){
				month = 1;
				year = d.getFullYear()+1;
			}else{
		     	month = d.getMonth()+2;
			}
			day1 = (d.getDate()+6)-days_in_month;
		}
		$scope.endDate = year+"-"+month+"-"+day1+" 00:00";//gyear+"-"+month+"-"+day1+" 00:00";
	$scope.randomColorFactor=function() {
        return Math.round(Math.random() * 255);
    }
	$scope.randomColor = function(opacity) {
         return 'rgba(' + $scope.randomColorFactor() + ',' + $scope.randomColorFactor() + ',' + $scope.randomColorFactor() + ',' + (opacity || '.3') + ')';
     }
	var bchart = "false", bchart1 = "false", bchart2 = "false";
    var myBarChart, myBarChart1, myBarChart2;
    var canvas1, canvas2;
    var url = "./getStoreList.action";
    $http.get(url).then(function (response) {
        $scope.storeList = (response.data);
    }, function (error) {
        alert("error");
    });
    $scope.downloadXLS = function (query) {
        var url = './xlsDownload.action?query=' + encodeURIComponent(query);
        $window.location = url;
    }
    	 $scope.getBarChartDataByStoreName = function (storeName, startDate, endDate) { 
    		 if (bchart == "true")
    	        {
    	    	myBarChart.destroy();
    	        }
    	        if (bchart1 == "true")
    	        {
    	            myBarChart1.destroy();
    	            bchart1 = "false"
    	        }
    	        if (bchart2 == "true")
    	        {
    	            myBarChart2.destroy();
    	            bchart2 = "false"
    	        }
    	   
        var count = 0;
        $scope.data = [];$scope.data1 = [];$scope.data2 = [];$scope.data3 = [];
        $scope.data4 = [];$scope.data5 = [];$scope.data6 = [];
        
        $scope.labels = [];$scope.orderCount = [];
        $scope.orderCount1 = [];$scope.orderCount2 = [];$scope.orderCount3 = [];$scope.orderCount4 = [];
        $scope.orderCount5 = [];$scope.orderCount6 = [];
        var dates1 = startDate.split("-");
        var day2 = dates1[2].split(" ");
        var month1 =  dates1[1];
    	var year1 = dates1[0];
    	$scope.dates = [];
    	$scope.dates[0]="0";
    	$scope.dates[1] = year1+"-"+month1+"-"+day2[0];
    	
    	for(var z=2;z<8;z++){
    	days_in_month = Date._MD[month1-1];   
		if(parseInt(day2[0])<days_in_month-1){
			day2[0]=parseInt(day2[0])+1;
		}
		else{
			if(month1==12){
				month1 = 1;
				year1 = parseInt(year1)+1;
			}else{
		     	month1 = parseInt(month1)+1;
			}
			day2[0] = (parseInt(day2[0])+1)-days_in_month;
		}
		$scope.dates[z] = year1+"-"+month1+"-"+day2[0];
    	}
    	var url = './barChartData.action?storeName=' + storeName + '&startDate=' + startDate + '&endDate=' + endDate;
        $http.get(url).then(function (response) {
            $scope.barChartData = (response.data);
            alert($scope.barChartData.length)
            for (var i = 0; i < $scope.barChartData.length; i++) {
            	if(i==0){
            		count =0;
            		$scope.data.push($scope.barChartData[i].data);
            		$scope.labels.push($scope.barChartData[i].storeName);
            		$scope.orderCount.push($scope.barChartData[i].id);
            	}
            	
            	else{	
            	if($scope.barChartData[i-1].storeName==$scope.barChartData[i].storeName){
            		count = count+1;
            		if(count == 1){$scope.data1.push($scope.barChartData[i].data);
            		$scope.orderCount1.push($scope.barChartData[i].id);}
            		else if(count==2){$scope.data2.push($scope.barChartData[i].data);
            		$scope.orderCount2.push($scope.barChartData[i].id);}
            		else if(count==3){$scope.data3.push($scope.barChartData[i].data);
            		$scope.orderCount3.push($scope.barChartData[i].id);}
            		else if(count==4){$scope.data4.push($scope.barChartData[i].data);
            		$scope.orderCount4.push($scope.barChartData[i].id);}
            		else if(count==5){$scope.data5.push($scope.barChartData[i].data);
            		$scope.orderCount5.push($scope.barChartData[i].id);}
            		else if(count==6){$scope.data6.push($scope.barChartData[i].data);
            		$scope.orderCount6.push($scope.barChartData[i].id);}
            	}
            	else{
            		count = 0;
                   $scope.data.push($scope.barChartData[i].id);
                   $scope.labels.push($scope.barChartData[i].storeName);
                   $scope.orderCount.push($scope.barChartData[i].id);
            	}
            }
                $scope.query = $scope.barChartData[i].query; 
            }
            var data = {
                datasets: [{
                	label: $scope.orderCount,
                        data: $scope.data,
                        
                        backgroundColor: [
                            "#F7464A",
                            "#46BFBD",
                            "#FDB45C"]
                    },
                    { label :$scope.orderCount1,
                        data: $scope.data1,
                        backgroundColor: $scope.randomColor(0.1)
                    },
                    { label :$scope.orderCount2,
                        data: $scope.data2,
                        backgroundColor: $scope.randomColor(0.2)
                    },
                    { label :$scope.orderCount3,
                        data: $scope.data3,
                        backgroundColor: $scope.randomColor(0.3)
                    },
                    { label :$scope.orderCount4,
                        data: $scope.data4,
                        backgroundColor: $scope.randomColor(0.4)
                    },
                    { label :$scope.orderCount5,
                        data: $scope.data5,
                        backgroundColor: $scope.randomColor(0.5)
                    },
                    { label :$scope.orderCount6,
                        data: $scope.data6,
                        backgroundColor: $scope.randomColor(0.6)
                    }
                    ],
                labels: $scope.labels,
                
            };
            if (bchart == "true") {
                myBarChart.destroy();
                bchart = "false";
            }
            
            var barCanvas = document.getElementById("barChart");
            var bctx = barCanvas.getContext("2d");
//            Chart.defaults.global.tooltips.enabled  = false;
            myBarChart = new Chart(bctx, {
                type: 'bar',
                data: data,
                              options :{
                                	tooltips:{enabled : false}, 
                                	animation: {
                                		onComplete: function() {
                                	    var ctx = this.chart.ctx;
                                	    ctx.textAlign = "center";
                                	    ctx.textBaseline = "bottom";

                                	    var chart = this;
                                        var datasets = this.config.data.datasets;
                                        datasets.forEach(function (dataset, i) {
                                        	ctx.fillStyle = dataset.strokeColor;
                                            chart.getDatasetMeta(i).data.forEach(function (p, j) {
                                                ctx.fillText(datasets[i].label[j], p._model.x, p._model.y + 20);
                                              });
                                	      });
                                	   
                                	   }
                                	},

                	scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Store Name'
                            }
                        }],
                        yAxes: [{
                          scaleLabel: {
                                display: true,
                                labelString: 'Date'
                            },
                            ticks: {
                            	beginAtZero:true,
                                stepSize: 1,
                                max : 7,
//                                // Create scientific notation labels
                                callback: function(value, index, ticks) { 
//                                	if(!(index % parseInt(ticks.length / 8))) {
                                	value=$scope.dates[k];
//                                	diff=ticks.length-d; alert(diff+"----------"+d)
                                	k--;
//                                	if(diff<-31){
                                	if(k<0){
                                	k=7;
                                	}
//                                	}
//                                	d++;
                                	return value ;
//                                	}
                                	
                                }
                            
                            
                            }
                        
                        }]
                    }
                }
            });
            d=0;k=7;
            bchart = "true";
        }, function (error) {
            alert("error");
        });
    }
        $scope.getBarChartDataByStoreName($scope.storeName1,$scope.startDate,$scope.endDate);
});
app.controller('angularPieChartController', function ($scope, $http, $window) {
		$('#startDate1').datetimepicker({
			format: 'Y-m-d H:i ',
		});
		
			$('#endDate1').datetimepicker({
				format: 'Y-m-d H:i ',
				});
	$scope.randomColorFactor=function() {
        return Math.round(Math.random() * 255);
    }
	$scope.randomColor = function(opacity) {
         return 'rgba(' + $scope.randomColorFactor() + ',' + $scope.randomColorFactor() + ',' + $scope.randomColorFactor() + ',' + (opacity || '.3') + ')';
     }
	var bchart = "false", bchart1 = "false", bchart2 = "false";
    var myBarChart, myBarChart1, myBarChart2;
    var canvas1, canvas2;
    var url = "./getStoreList.action";
    $http.get(url).then(function (response) {
        $scope.storeList = (response.data);
    }, function (error) {
        alert("error");
    });
    $scope.downloadXLS = function (query) {
        var url = './xlsDownload.action?query=' + encodeURIComponent(query);
        $window.location = url;
    }
        var chart = "false", chart1 = "false", chart2 = "false";
    var myNewChart, myNewChart1, myNewChart2;
    var canvas1, canvas2;
    var url = "./getStoreList.action";
    $http.get(url).then(function (response) {
        $scope.storeList = (response.data);
    }, function (error) {
        alert("error");
    });
//    $scope.downloadXLS = function (query) {
//        var url = './xlsDownload.action?query=' + encodeURIComponent(query);
//        $window.location = url;
//    }
    $scope.getChartDataByStoreName = function (storeName, startDate, endDate) { 
    	if (chart== "true")
        {
        myNewChart.destroy();
        }
        if (chart1 == "true")
        {
            myNewChart1.destroy();
            chart1 = "false"
        }
        if (chart2 == "true")
        {
            myNewChart2.destroy();
            chart2 = "false"
        }
        $scope.data = [];
        $scope.labels = [];
        var url = './chartData.action?storeName=' + storeName + '&startDate=' + startDate + '&endDate=' + endDate;
        alert(url)
        $http.get(url).then(function (response) {
            alert(JSON.stringify(response) + "---------------------")
            $scope.chartData = (response.data);
            for (var i = 0; i < $scope.chartData.length; i++) {
                $scope.data.push($scope.chartData[i].id);
                $scope.labels.push($scope.chartData[i].type);
                $scope.query = $scope.chartData[i].query;
            }
            var data = {
                datasets: [{
                	    data: $scope.data,
                        backgroundColor: $scope.randomColor(0.5)
                    }],
                labels: $scope.labels
            };
            if (chart == "true") {
                myNewChart.destroy();
                chart = "false";
            }
            var canvas = document.getElementById("myChart");
            var ctx = canvas.getContext("2d");
            myNewChart = new Chart(ctx, {
                type: 'pie',
                data: data
            });
            chart = "true";
            canvas.onclick = function (evt) {
                var activePoints = myNewChart.getElementsAtEvent(evt);
                var chartData = activePoints[0]['_chart'].config.data;
                var idx = activePoints[0]['_index'];

                var label = chartData.labels[idx];
                var value = chartData.datasets[0].data[idx];
                if (chart1 == "true") {
                    myNewChart1.destroy();
                    if (chart2 == "true") {
                        myNewChart2.destroy();
                        chart2 = "false";
                    }
                    chart1 = "false";
                } else {
                    canvas1 = document.getElementById("myChart1");
                    var ctx = canvas1.getContext("2d");
                    myNewChart1 = new Chart(ctx, {
                        type: 'pie',
                        data: data
                    });
                    chart1 = "true";
                }
                canvas1.onclick = function (evt) {
                    var activePoints1 = myNewChart1.getElementsAtEvent(evt);
                    var chartData1 = activePoints1[0]['_chart'].config.data;
                    var idx1 = activePoints1[0]['_index'];

                    var label1 = chartData.labels[idx1];
                    var value1 = chartData.datasets[0].data[idx1];
                    if (chart2 == "true") {
                        myNewChart2.destroy();
                        chart2 = "false";
                    } else {
                        canvas2 = document.getElementById("myChart2");
                        var ctx = canvas2.getContext("2d");
                        myNewChart2 = new Chart(ctx, {
                            type: 'pie',
                            data: data
                        });
                        chart2 = "true";
                    }
                };
            };
        }, function (error) {
            alert("error");
        });
    }
    $scope.getChartDataByStoreName();
});
