$(document).ready(function() {

var map = new L.Map('map'),
		    tiles = new L.TileLayer('http://a.tiles.mapbox.com/v3/bobbysud.map-ez4mk2nl/{z}/{x}/{y}.png', {maxZoom: 17}),
		    photoLayer = new L.LayerGroup(),
		    clientId = 'f62cd3b9e9a54a8fb18f7e122abc52df',
		    circle;

		map.addLayer(tiles);

		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);

		map.locateAndSetView(13);


		function onLocationFound(e) {
			
		}

		function onLocationError(e) {
			map.setView(new L.LatLng(37.76745803822967, -122.45018005371094), 13).addLayer(tiles);
		}



			map.on('click', onMapClick);

			map.addLayer(photoLayer);

			function onMapClick(e) {
			    if (!circle) {
			        circle = new L.Circle(e.latlng, 1700, {
			            color: '#919191',
			            fill: true,
			            fillOpacity: 0.1,
			            weight: 1.5,
			            clickable: false,
			        });
			        map.addLayer(circle)
			    } else {
			        circle.setLatLng(e.latlng);
			    }

			    $().instagram({
			    	search: {
			    		lat: e.latlng.lat.toFixed(2),
			    		lng: e.latlng.lng.toFixed(2)
			    	},
			    	clientId: clientId,
			    	onComplete: function(photos){
			    		photoLayer.clearLayers();

			    		_.each(photos, function(photo) {
			    			if (photo.location)
			    			{
			    				var object =  new L.CircleMarker(new L.LatLng(photo.location.latitude, photo.location.longitude), {
			    					radius: 7,
			    					clickable: true
			    				});
			    				
			    				var photoTemplate = _.template($("#popupTemplate").html(), {photo: photo});
			    				object.bindPopup(photoTemplate);

			    				photoLayer.addLayer(object);

			    				
			    			}
			    		});
			    	}
			    });
			}




			// Add zoom out button
      		$('<div>zoom out</div>')
      		  .addClass('zoom-out')
      		  .attr('title', 'See somewhere other than San Francisco, the map demo capital of the world.')
      		  .click(function() {
      		    map.setView(new L.LatLng(40.84706035607122, -94.482421875), 4);
      		  })
      		  .appendTo($('#map'));

     });
