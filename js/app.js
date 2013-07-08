$(function(){

		// $('.open-panel').click()

		var model = new Backbone.Model();

		var time = new Date().getTime()/1000-604800;//Max time back is 1 week. 604800 is 1 week.
		console.log(time)

		model.set({
				photo:true,
				video:true,
				clustering: true,
				radius: 500,
				video: true,
				likes: 'all',
				filters:'all',
				min_timestamp:0,
				max_timestamp:time,
				liar:false
		});

		var map = L.mapbox.map('map', 'bobbysud.map-uufxk4qo').setView([37.7695,-122.4302],14);
		var hash = new L.Hash(map);

		var MyControl = L.Control.extend({
		    options: {
		        position: 'topleft'
		    },

		    onAdd: function (map) {
		        var container = L.DomUtil.create('div', 'locator');
		        return container;
		    }
		});
		map.addControl(new MyControl());
		$('.locator').append('<a href=""><img src="css/arrow1.png" width=11px height=11px /></a>')

		var ListView = Backbone.View.extend({
				el: $('body'),
				events: {
      			'click #map': 'addItem',
      			'click .ui-panel-animate': 'updateParam',
      			'click .locator': 'findLocation'
    		},
		
				initialize: function(){
						_.bindAll(this, 'render');
						this.render();
				},
		
				render: function(){
						
				},
				findLocation: function(e){
						e.preventDefault()
						function onLocationFound(e) {
								var myIcon = L.divIcon({className: 'my-div-icon'});	
								L.marker(e.latlng,{icon:myIcon}).addTo(map)
						}

						function onLocationError(e) {
							alert(e.message)
						}

						map.on('locationfound', onLocationFound);
						map.on('locationerror', onLocationError);
						map.locate({setView: true, maxZoom: 16});
				},
				updateParam: function(e){
						e.preventDefault();
						var radius = $('#slider-distance').val();
						var likes = $('#slider-likes').val();
						var video = $('#video').val();
						var cluster = $('#cluster').val();
						var photo = $('#photo').val();
						var dayMin = $('#range-10b').val();
						var dayMax = $('#range-10a').val();
						console.log(dayMax)
						
						var secDay = 86400;
						var newMin = new Date().getTime()/1000 - (secDay * dayMin)
						var newMax = new Date().getTime()/1000 - (secDay * dayMax)

						model.set({
								video:video,
								photo:photo,
								clustering:cluster,
								radius:radius,
								likes: likes,
								max_timestamp: newMax
						});
				}
		});

		// **listView instance**: Instantiate main app view.
		var listView = new ListView();

		function getPhotos(maps){
				
				var llat = maps.latlng.lat;
				var llng = maps.latlng.lng;
				var radius = model.get('radius');
				var video = model.get('video');
				var includePhoto = model.get('photo');
				var min_timestamp = model.get('min_timestamp');
				var max_timestamp = model.get('max_timestamp');
				var clusterOn = model.get('clustering');
				$('.leaflet-overlay-pane svg g').remove();

				console.log(max_timestamp)
				
				var circle = new L.Circle(maps.latlng, radius, {
						color: '#919191',
						fill: false,
						fillOpacity: 0,
						weight: 1.5,
						clickable: false
				});

				map.addLayer(circle);

				var loadingIcon = L.divIcon({className: 'loading', html:"<h1>Loading</h1>", clickable:false});

		    var loading = L.marker(maps.latlng,{
		    	icon:loadingIcon
		    }).addTo(map);

				var markers = new L.MarkerClusterGroup({
						disableClusteringAtZoom:17,
						animateAddingMarkers: true
				});

				if(!clusterOn){
						markers.options.disableClusteringAtZoom = 1;
				}
				
				var url = 'https://api.instagram.com/v1/media/search?lat=' + llat + '&lng=' + llng + '&distance=' + radius + '&min_timestamp=' + min_timestamp + '&max_timestamp=' + max_timestamp + '&client_id=5d1ba596dc034a7a8895e309f5f2452f&count=100';	
				
				return $.ajax({
		      	type: "GET",
			      dataType: "jsonp",
			      cache: true,
			      url: url,
			      success: function (photos) {
			      		$.each(photos.data, function(num){
			      				
			      				var lat = photos.data[num].location.latitude;
			      				var lng = photos.data[num].location.longitude;
			      				var link = photos.data[num].link;
			      				var likes = photos.data[num].likes.count;
			      				var name = photos.data[num].user.full_name;
			      				var username = photos.data[num].user.username;
			      				var profile = photos.data[num].user.profile_picture;
			      				var imgUrl = photos.data[num].images.low_resolution.url;
			      				var imgThumb = photos.data[num].images.thumbnail.url;
			      				var filter = 'filter - ' + photos.data[num].filter;
			      				var date = $.timeago(new Date(parseInt(photos.data[num].created_time) * 1000));
			      				
			      				if(photos.data[num].location.name){
			      						var location = 'at ' + photos.data[num].location.name;
			      				}else{
			      						var location = '';
			      				}

			      				if(photos.data[num].videos){
			      						var videoUrl = photos.data[num].videos.low_resolution.url;
			      				}

			      				if(photos.data[num].caption){
			      						var caption = photos.data[num].caption.text
			      				}else{
			      						var caption = '';
			      				}

			      				// console.log(photos.data[num])
			      				
			      				var imageIcon = L.icon({
			      				    iconUrl: imgThumb,
			      				    iconRetinaUrl: imgThumb,
			      				    iconSize: [40, 40],
			      				    iconAnchor: [20, 20],
			      				});

			      		    var marker = L.marker(new L.LatLng(lat,lng),{
			      		    	icon:imageIcon
			      		    });

			      		    var videoIcon = L.divIcon({
			      		    	className: 'video-icon',
			      		    	html:'Video',
			      		    	iconAnchor: [20,20]
			      		    });

			      		    var markerVideo = L.marker(new L.LatLng(lat,lng),{
			      		    	icon:videoIcon
			      		    });

			      		    markerVideo.bindPopup(""+
			      		    	'<div class="top-text">'+
			      		    		
			      		    		'<a href="http://instagram.com/' + username + '" target=_blank>'+
			      		    			'<img src="' + profile + '" height="40px" width="40px" class="profile"/>'+
			      		    			// '<p>' + name + '</p>' +
			      		    			'<p>' + username + '</p>' +
			      		    		'</a>' +

				      		    	'<div class="pull-right">' +
				      		    		'<p>' + date + '</p>' +
				      		    		'<p>' + location + '</p>' +
				      		    		'<p>' + filter + '</p>' +
				      		    	'</div>'+
			      		    	'</div>' +

			      		    	'<a href="' + link + '" target=_blank>'+
			      		    		'<video width="280" height="280" controls autoplay loop><source src="' + videoUrl + '" type="video/mp4">Your browser does not support the video tag.</video>'+
			      		    	'</a>'+

			      		    	'<div class="bottom-text">' +
			      		    		'<p>' + likes + ' <span id="heart">♡</span></p>' +
			      		    		'<h3>'+caption+'</h3>' +
			      		    	'</div>',{
			      		    	maxWidth:280,
			      		    	autoPan:false
			      		    });

			      		    marker.bindPopup(""+
			      		    	'<div class="top-text">'+
			      		    		
			      		    		'<a href="http://instagram.com/' + username + '" target=_blank>'+
			      		    			'<img src="' + profile + '" height="40px" width="40px" class="profile"/>'+
			      		    			// '<p>' + name + '</p>' +
			      		    			'<p>' + username + '</p>' +
			      		    		'</a>' +

				      		    	'<div class="pull-right">' +
				      		    		'<p>' + date + '</p>' +
				      		    		'<p>' + location + '</p>' +
				      		    		'<p>' + filter + '</p>' +
				      		    	'</div>'+
			      		    	'</div>' +

			      		    	'<a href="' + link + '" target=_blank>'+
			      		    		'<img src="' + imgUrl + '" height="280px" width="280px"/>'+
			      		    	'</a>'+
			      		    	'<div class="bottom-text">' +
			      		    		'<p>' + likes + ' <span id="heart">♡</span></p>' +
			      		    		'<h3>'+caption+'</h3>' +
			      		    	'</div>',{
			      		    	maxWidth:280,
			      		    	autoPan: false
			      		    });
										console.log(includePhoto)
										if(includePhoto){
												markers.addLayer(marker);	
										}

		    		        if(photos.data[num].videos){
		    		        		markers.addLayer(markerVideo);
		    		        }
		    		        
					      		map.addLayer(markers);

					      		marker.on('mouseover', function(e) {
					      				marker.openPopup();
					      		});
					      		markerVideo.on('mouseover', function(e) {
					      				markerVideo.openPopup();
					      		});

			      		    // markers.options.iconCreateFunction: function(cluster) {
			      		    //     return new L.DivIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
			      		    // }

					      		$('.loading').remove();

					      });
			      }
		    });
		}
		map.on('click',getPhotos)


});

