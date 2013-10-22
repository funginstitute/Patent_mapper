function refresh_state() {
			alart("hi");
			var year_val = document.getElementById("yearSelect");
			var year = year_val.options[year_val.selectedIndex].text;
			if ($("#state").val().length == 0) {
				alert("Please select a state.");
			}
			//window.location.replace("./map5.html");
			// Load the station data. When the data comes back, create an overlay.

			$.ajax({
				url: "http://127.0.0.1:5000/" + $('#state').val() + '/' + year,
				dataType: "jsonp",
				crossDomain: true,
				success: function(data) {
					//alert("Please zoom in!");
					//console.log(data);
					//console.log(data.)
					//alert(Object.keys(data).length)
				},
				error: function(data) {
					alert("Please reload the page!");
				}
			});

			//retriving the data from database
			d3.json("http://127.0.0.1:5000/" + $('#state').val() + '/' + year, function(data) {
			
				var Lat, Lon;
				var overlay = new google.maps.OverlayView();
			  // Add the container when the overlay is added to the map.
			  			  overlay.onAdd = function() {
			    var layer = d3.select(this.getPanes().overlayLayer).append("div")
				.attr("class", "stations");
			 
			    // Draw each marker as a separate SVG element.
			    // We could use a single SVG, but what size would it have?

			    overlay.draw = function() {
				    var projection = this.getProjection(),
					padding = 10;
				 		
					var markers = [];
					map = new google.maps.Map(d3.select("#map").node(), {
						zoom: 5,
						center: new google.maps.LatLng(37.76487, -122.41948),
						mapTypeId: google.maps.MapTypeId.TERRAIN
					});

				//console.log(data.length)

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
			 		
			 	var markerCluster = new MarkerClusterer(map, markers);
				 	google.maps.event.addListener(markers, 'click', function () {
	                infoWindow.open(map, markers);
           		 });
			      // Add a circle.
			      marker.append("svg:circle")
				  .attr("r", 4.5)
				  .attr("cx", padding)
				  .attr("cy", padding);
			 
			      // Add a label.
			      marker.append("svg:text")
				  .attr("x", padding + 7)
				  .attr("y", padding)
				  .attr("dy", ".31em")
				  //.text(function(d) { return d.key; });
			 		 
			      function transform(d) {
			      	Lat = d.value[1];
			      	Lon = d.value[0];
					latlng = new google.maps.LatLng(Lat, Lon);
					var mark = new google.maps.Marker({
			            position: latlng,
			            //value: 1,
			            value: parseInt(d.key),
			            clickable: true,
			            animation: google.maps.Animation.DROP
			        });
			        markers.push(mark);
			        //console.log("hello");
			         
			        /*
			        d = projection.fromLatLngToDivPixel(d);
					return d3.select(this)
					  .style("left", (d.x - padding) + "px")
					  .style("top", (d.y - padding) + "px");
					 */
			      }
			    };
			    //google.maps.event.addDomListener(window, 'load', refresh_state);
			  };
			  // Bind our overlay to the map…
			  overlay.setMap(map);
			  
			}
		)}