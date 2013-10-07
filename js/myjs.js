jQuery(function($) {
	var infoWindow = new google.maps.InfoWindow();
	$("#navbar").hide()
	$("body").mouseover( function() {
		$("#navbar").show()
	});
	$("body").mouseout( function() {
		$("#navbar").hide()
	})
	$("#draggable").draggable({ containment: "document" });
	//$('body').hide().fadeIn(3000);
	populateYears(1975,2010,'#yearSelect')
	populateYears(1,1000,'#cla')


	$("#click").click(function () {
		refresh_state();
	});


	$('#statediv, #year, #class').mouseover( function() {
		$(this).tooltip('show')
	});
	function populateYears(first, last, selector) {
			//console.log('years: ' + selector);
			if (selector == "#cla") {
				$(selector).append($("<option>", {
					value: "",
					text: "--Class--"
				}));
			}
			
			for (i = 0; (first + i) <= last; i++) {
				val = first + i
				$(selector).append($("<option>", {
					value: val,
					text: val
				}));
			}
		}
	var map = new google.maps.Map(d3.select("#map").node(), {
	  zoom: 3,
	  center: new google.maps.LatLng(37.76487, -122.41948),
	  mapTypeId: google.maps.MapTypeId.TERRAIN
	});
	google.maps.event.addListener(map, 'click', function() { 
		if (infoWindow) {
	            		infoWindow.close();
	            	}
	 });
	
	function refresh_state() {
		$('#button').button('loading');
		var year = $("#yearSelect").val();
		/**
		$("#temp").remove();
		var hey = "<div id=\"temp\" class=\"alert alert-danger\"><button type=\"button\" class=\"close\" \
		data-dismiss=\"alert\">&times;</button><h4><strong>Please select a State!</strong></h4></div>";
		if ($("#state").val().length == 0) {
			$("#statediv").append(hey)
			//alert("Please select a state.");
			return 
		}*/
		
		var patClass = $("#cla").val();
		//window.location.replace("./map5.html");
		// Load the station data. When the data comes back, create an overlay.

		var link
		if (($("#state").val().length == 0) && (patClass == "")) {
			link = "http://127.0.0.1:5000/" + "empty" + '/' + year + '/' + "empty";
		} else if (($("#state").val().length == 0) && (patClass != "")) {
			link = "http://127.0.0.1:5000/" + "empty" + '/' + year + '/' + patClass;
		} else if (patClass != "") {
			link = "http://127.0.0.1:5000/" + $('#state').val() + '/' + year + '/' + patClass;
		} else {
			link = "http://127.0.0.1:5000/" + $('#state').val() + '/' + year + '/' + "empty";
		}
		$.ajax({
			type: "GET",
			url: link,
			dataType: "jsonp",
			crossDomain: true,
			success: function(data) {

			},
			error: function(data) {
				alert("Please reload the page!");
			}

		});

		
		//retriving the data from database
		d3.json(link, function(data) {
			if ($.isPlainObject(data)) {
				$("#temp").remove();
				if (Object.keys(data).length == 0) {
					var hey = "<div id=\"temp\" class=\"alert alert-danger\"><button type=\"button\" class=\"close\" \
					data-dismiss=\"alert\">&times;</button><h4><strong>Patent not found! Please adjust selection.</strong></h4></div>";
					$("#class").append(hey)
					$('#button').button('reset')
				return;
				}
			}
			
			var Lat, Lon;
			var overlay = new google.maps.OverlayView();
		  	// Add the container when the overlay is added to the map.
		  	overlay.onAdd = function() {
		    	var layer = d3.select(this.getPanes().overlayLayer).append("div")
					.attr("class", "stations");
		 

		    // Draw each marker as a separate SVG element.
		    overlay.draw = function() {
			    var projection = this.getProjection(),
				padding = 10;
			 		
				var markers = [];
				map = new google.maps.Map(d3.select("#map").node(), {
					zoom: 5,
					center: new google.maps.LatLng(37.76487, -122.41948),
					mapTypeId: google.maps.MapTypeId.TERRAIN
				});

				google.maps.event.addListener(map, 'zoom_changed', function() { 
					if (infoWindow) {
	            		infoWindow.close();
	            	}
	            	$('#expos').hide()
	 			});

				//creating markers
		      	var marker = layer.selectAll("svg")
				  .data(d3.entries(data))
				  .each(transform) // update existing markers
				  .enter().append("svg:svg")
				  .each(transform)
				  .attr("class", "marker");

				map.setOptions({
					center: new google.maps.LatLng(Lat, Lon),
					zoom: 5
					});
			 		var clusterOptions = { zoomOnClick: false }
			 	var markerCluster = new MarkerClusterer(map, markers, clusterOptions);
		        

		        //creating listener
	            google.maps.event.addListener(markerCluster, "clusterclick", function (m) { 
		            if (infoWindow) {
		            	infoWindow.close();
		            }
		            infoWindow = new google.maps.InfoWindow(); 
		            var info = new google.maps.MVCObject; 
		            info.set('position', m.getCenter());
		            var mark = m.getMarkers();
		            var compoundedData = "<strong> Patent | Inventor | Assignee | LAT | LON</strong><br>";
		            var output = ""
		            for(var i = 0; i < mark.length; i++) {
		            	//console.log(mark[i])
					 compoundedData += "<span>" + mark[i].getTitle() + "</span><br>";
					 output += mark[i].getTitle() + "\n";
					}
					$("#expo").attr("href", "data:text/plain;base64," + btoa(output) )
					$("#expo").attr("download", "fung_geolocation.csv")
					$("#expo").html("Export patent infomation of this location.");
					$("#expos").css({"margin-top":"45px", "text-align":"center"})
					$("#expos").show()
					$("#hint").remove()
					var download = "<div id=\"hint\" class=\"alert alert-info\"><button type=\"button\" class=\"close\" \
					data-dismiss=\"alert\">&times;</button><h6><strong>To export patent information, click above.</strong></h6></div>";
					$("#expos").append(download)
	   				infoWindow.setContent(compoundedData);
	    			infoWindow.open(map,info);
	   		 	});

			      function transform(d) {
			      	Lat = d.value[1];
			      	Lon = d.value[0];
					latlng = new google.maps.LatLng(Lat, Lon);
					var mark = new google.maps.Marker({
			            position: latlng,
			            title: (d.key).toString() + " , " + " \"" + d.value[2]
			            + "," + d.value[3]+ "\" " + " , " + d.value[4] + " , " + "Lat:" + d.value[0] + " ," + " Lon:" + d.value[1],
			            //clickable: true,
			            animation: google.maps.Animation.DROP
			        });

			        
			        google.maps.event.addListener(mark, "click", function (e) {
			        	if (infoWindow) {
		            		infoWindow.close();
		            	}
		            	infoWindow = new google.maps.InfoWindow();
		            	out = mark.getTitle()
		            	outp = "<span> Patent | Inventor | Assignee</span><br>" + out
		                infoWindow.setContent(outp);
		                $("#expo").attr("href", "data:text/plain;base64," + btoa(out) )
						$("#expo").attr("download", "export.txt")
						$("#expo").html("Export Patent infomation of this location.")
						$("#expos").css({"margin-top":"45px", "text-align":"center"})
						$("#expos").show()
		                infoWindow.open(map, mark);
		            });
			     markers.push(mark);
		      	}
		    	};
		    //clear loading button
		    	$('#button').button('reset')
		  	};
		  	// Bind our overlay to the map…
		 	overlay.setMap(map);
		 	$('body').hide().fadeIn(3000);
		}
	)}
});