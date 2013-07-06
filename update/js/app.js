$(function(){

		// $('.open-panel').click()

		var model = new Backbone.Model();

		var time = new Date().getTime()/1000-604800;
		$('#date-2').val(time)

		model.set({
				clustering: true,
				radius: 500,
				video: true,
				likes: 'all',
				filters:'all',
				min_timestamp:0,
				max_timestamp:time,
				liar:false
		});

		console.log(model.get('max_timestamp'))

		var map = L.mapbox.map('map', 'bobbysud.map-uufxk4qo').addControl(L.mapbox.geocoderControl('bobbysud.map-uufxk4qo'));

		var ListView = Backbone.View.extend({
				el: $('body'),
				events: {
      			'click #map': 'addItem',
      			'click .update': 'updateParam'
    		},
		
				initialize: function(){
						_.bindAll(this, 'render');
						this.render();
				},
		
				render: function(){
						
						function onLocationFound(e) {
								var myIcon = L.divIcon({className: 'my-div-icon'});	
								L.marker(e.latlng,{icon:myIcon}).addTo(map)
						}

						function onLocationError(e) {
								alert(e.message);
						}

						map.on('locationfound', onLocationFound);
						map.on('locationerror', onLocationError);
						map.locate({setView: true, maxZoom: 16});
				},
				addItem: function(e){
						// console.log(e)
				},
				updateParam: function(e){
						e.preventDefault();
						var radius = $('#slider-distance').val();
						var likes = $('#slider-likes').val();
						var video = $('#video').val();
						var cluster = $('#cluster').val();
						console.log(cluster)

						model.set({
								video:video,
								clustering:cluster,
								radius:radius,
								likes: likes,
						});
				}
		});

		// **listView instance**: Instantiate main app view.
		var listView = new ListView();

		function getPhotos(maps){
				
				var llat = maps.latlng.lat;
				var llng = maps.latlng.lng;
				var radius = model.get('radius');
				var min_timestamp = model.get('min_timestamp');
				var max_timestamp = model.get('max_timestamp');
				var clusterOn = model.get('clustering');
				var liar = model.get('liar');
				$('.leaflet-overlay-pane svg g').remove();
				
				var circle = new L.Circle(maps.latlng, radius, {
						color: '#919191',
						fill: false,
						fillOpacity: 0,
						weight: 1.5,
						clickable: false
				});

				map.addLayer(circle);

				if(clusterOn = true){
						var markers = new L.MarkerClusterGroup({
							disableClusteringAtZoom:17,
							animateAddingMarkers: true
						});
				}else{
						var markers = new L.MarkerClusterGroup({
							disableClusteringAtZoom:1,
						});
				}
				
				if(liar == true){
						var url = 'https://api.instagram.com/v1/tags/nofilter/media/recent?access_token=11377329.f59def8.c525cc868be84315ba04c4f10e4c74b1&count=1000'
				}else{
						var url = 'https://api.instagram.com/v1/media/search?lat=' + llat + '&lng=' + llng + '&distance=' + radius + '&min_timestamp=' + min_timestamp + '&max_timestamp=' + max_timestamp + '&client_id=5d1ba596dc034a7a8895e309f5f2452f&count=100';	
				}
				

				return $.ajax({
		      	type: "GET",
			      dataType: "jsonp",
			      cache: true,
			      url: url,
			      success: function (photos) {
			      		$.each(photos.data, function(num){
			      				
			      				var lat = photos.data[num].location.latitude;
			      				var lng = photos.data[num].location.longitude;
			      				var imgUrl = photos.data[num].images.low_resolution.url;
			      				if(photos.data[num].videos){
			      						var videoUrl = photos.data[num].videos.low_resolution.url;
			      				}

			      				if(photos.data[num].caption){
			      						var caption = photos.data[num].caption.text
			      						console.log(caption)
			      				}else{
			      						var caption = '';
			      				}


			      				console.log(photos.data[num])
			      				
			      				var imageIcon = L.icon({
			      				    iconUrl: imgUrl,
			      				    iconRetinaUrl: imgUrl,
			      				    iconSize: [40, 40],
			      				    iconAnchor: [20, 20],
			      				});

			      				var videoIcon = L.divIcon({className: 'video-icon', html:'Video'});

			      		    var marker = L.marker(new L.LatLng(lat,lng),{
			      		    	icon:imageIcon
			      		    });

			      		    var markerVideo = L.marker(new L.LatLng(lat,lng),{
			      		    	icon:videoIcon
			      		    });

			      		    markerVideo.bindPopup('<video width="320" height="320" controls autoplay loop><source src="' + videoUrl + '" type="video/mp4">Your browser does not support the video tag.</video><p>'+caption+'</p>',{
			      		    	maxWidth:400
			      		    })

			      		    marker.bindPopup("<img src='"+imgUrl+"' height='320px' width='320px'/><p>"+caption+"</p>",{
			      		    	maxWidth:400
			      		    })

		    		        markers.addLayer(marker);
		    		        if(photos.data[num].videos){
		    		        		markers.addLayer(markerVideo);
		    		        }
		    		        
					      		map.addLayer(markers);
					      		
					      		if(liar == true){
					      				map.fitBounds(markers.getBounds().pad(0.3));	
					      		}

					      });
			      }
		    });
		}
		map.on('click',getPhotos)

});

