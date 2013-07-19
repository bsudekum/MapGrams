$(function(){
		// $('.open-panel').click()

		var model = new Backbone.Model();

		var time = new Date().getTime()/1000-604800;//Max time back is 1 week. 604800 is 1 week.

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
			liar:false,
			userId: null,
			whos: 'user',
			token: '',
			username: ''
		});

		var map = L.mapbox.map('map', 'bobbysud.map-uufxk4qo',{
			fadeAnimation:false
		}).setView([37.7746,-122.4373],16);

		var hash = new L.Hash(map);
		
		map.attributionControl.addAttribution('Bobby Sudekum');

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

		var markers = new L.MarkerClusterGroup({
			disableClusteringAtZoom:17,
			maxClusterRadius:50,
			animateAddingMarkers: true
		});

		var ListView = Backbone.View.extend({
				el: $('body'),
				events: {
      			'click #map': 'addItem',
      			'change form': 'updateParam',
      			'click .locator': 'findLocation',
      			'click .sign-in': 'signIn',
      			'submit #user-form': 'getUserName'
    		},
		
				initialize: function(){
					_.bindAll(this, 'render');
					this.render();
				},

				mapUser: function(){
					console.log(model.get('userId'));
				},
		
				render: function(){
					if(location.hash.length > 35) {
						var aToken = location.hash.substr(1);
						
						model.set({
							token: aToken
						});

						$.ajax({
					      	type: 'GET',
							dataType: 'jsonp',
							cache: true,
							url: 'https://api.instagram.com/v1/users/self/feed?' + aToken,
							success: function (photos) {
								runPhotos(photos)
							}
						});
						console.log('logged in')
					}else{
						console.log('not logged in')
					}
				},

				getUserName: function(e) {
					e.preventDefault()
				},

				getUserPhoto: function(e){
					if($('#radio-choice-v-2b').is(':checked')){
							var user = 'user'
						}else{
							var user = 'friend'
						}
						console.log(user)
						model.set({
							whos: user
						});
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
						
						var radius = $('#slider-distance').val();
						var likes = $('#slider-likes').val();
						var video = $('#video').val();
						var cluster = $('#cluster').val();
						var photo = $('#photo').val();
						var dayMin = $('#range-10b').val();
						var dayMax = $('#range-10a').val();
						var u = $('#username').val();
						model.set({
							username: u
						});
						if($('#radio-choice-v-2a').is(':checked')){
							var user = 'user'
						}else{
							var user = 'friend'
						}
						console.log(photo)
						console.log(model.get('token'))
						
						var secDay = 86400;
						var newMin = new Date().getTime()/1000 - (secDay * dayMin)
						var newMax = new Date().getTime()/1000 - (secDay * dayMax)

						model.set({
							video:video,
							photo:photo,
							clustering:cluster,
							radius:radius,
							likes: likes,
							max_timestamp: newMax,
							whos: user
						});

						var aToken = model.get('token')
						var userName = model.get('username');
						console.log(userName)

						if(userName && aToken.length>2){
							var url = 'https://api.instagram.com/v1/users/search?q=' + userName + '&' + aToken
							$.ajax({
						    	type: 'GET',
								dataType: 'jsonp',
								cache: true,
								url: url,
								success: function (user) {
									
									var user = user.data[0].id;
									
									$.ajax({
								    	type: 'GET',
										dataType: 'jsonp',
										cache: true,
										url: 'https://api.instagram.com/v1/users/' + user + '/media/recent/?' + aToken,
										success: function (photos) {
											console.log(photos)
											runPhotos(photos)
										}
									});
								}
							});

						}else{
							if(aToken){
								var url = 'https://api.instagram.com/v1/users/self/feed?' + aToken;	
							}else{
								alert('please sign in first')
							}
						}

						$.ajax({
					    	type: 'GET',
							dataType: 'jsonp',
							cache: true,
							url: url,
							success: function (photos) {
								$('.sign-in .ui-btn-text').html("Signed in");
								runPhotos(photos)
							}
						});
				},
				signIn: function(e){
					
					if(location.host == 'localhost:8000'){
						var CLIENT_ID = '52838ef4a1e14d0cbbad8b20d71714d4';
						var CALLBACK_URL = 'http://localhost:8000/';
					}else{
						var CLIENT_ID = 'c498856d8c394e109d9350203dd1d488';
						var CALLBACK_URL = 'http://mapgrams.com/';
					}
					
					location.href="https://instagram.com/oauth/authorize/?display=touch&client_id="+CLIENT_ID+"&redirect_uri="+CALLBACK_URL+"&response_type=token";
				},
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
					maxClusterRadius:50,
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
			      		runPhotos(photos)
			      }
		    });
		}

		map.on('click',getPhotos)

		function runPhotos(photos){
			$.each(photos.data, function(num){
			      				
  				var link = photos.data[num].link;
  				var likes = photos.data[num].likes.count;
  				var name = photos.data[num].user.full_name;
  				var username = photos.data[num].user.username;
  				var profile = photos.data[num].user.profile_picture;
  				var imgUrl = photos.data[num].images.low_resolution.url;
  				var imgThumb = photos.data[num].images.thumbnail.url;
  				var filter = 'filter - ' + photos.data[num].filter;
  				var video = model.get('video');
				var includePhoto = model.get('photo');
  				var date = $.timeago(new Date(parseInt(photos.data[num].created_time) * 1000));
  				
  				if(photos.data[num].location){
  					
  					var lat = photos.data[num].location.latitude;
  					var lng = photos.data[num].location.longitude;
  					var show = true;

  					if(photos.data[num].location.name){
  						var location = 'at ' + photos.data[num].location.name;
  					}else{
  						var location = '';
  					}

  				}else{
  					var lat = 0;
  					var lng = 0;
  					var show = false;
  				}

  				if(photos.data[num].videos){
  					var videoUrl = photos.data[num].videos.low_resolution.url;
  				}

  				if(photos.data[num].caption){
  						var caption = photos.data[num].caption.text
  				}else{
  					var caption = '-';
  				}
  				
  				var imageIcon = L.icon({
  					className: show,
  				    iconUrl: imgThumb,
  				    iconRetinaUrl: imgThumb,
  				    iconSize: [40, 40],
  				    iconAnchor: [20, 20],
  				});

      		    var marker = L.marker(new L.LatLng(lat,lng),{
      		    	icon:imageIcon,
      		    	className:show
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
      		    		'<video width="280" height="280" autoplay loop><source src="' + videoUrl + '" type="video/mp4">Your browser does not support the video tag.</video>'+
      		    	'</a>'+

      		    	'<div class="bottom-text">' +
      		    		'<p>' + likes + ' <span id="heart">♡</span></p>' +
      		    		'<p>'+caption+'</p>' +
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
      		    		// '<p>' + likes + ' <span id="heart">♡</span></p>' +
      		    		'<p class="caption">'+caption+'</p>' +
      		    	'</div>',{
      		    	maxWidth:280,
      		    	autoPan: false
      		    });
							
				if(includePhoto){
					markers.addLayer(marker);	
				}

		        if(photos.data[num].videos){
		        	markers.addLayer(markerVideo);
		        }

		        // markers.options.iconCreateFunction = function(cluster){
		        // 	for(i=1;i<cluster.getChildCount();i++){
		        // 		if (i==10) break;
		        // 		var cl ='<img src="' + cluster.getAllChildMarkers()[i].options.icon.options.iconUrl + '"/>';
		        // 		var cls = cl + cls
		        // 	}

		        // 	return new L.DivIcon({
		        // 		html: cls ,
		        // 		className: 'cluster-image',
		        // 		iconAnchor:[40,20]
		        // 	});
		        // }
		        
	      		map.addLayer(markers);

	      		marker.on('mouseover', function(e) {
	      			marker.openPopup();
	      		});
	      		markerVideo.on('mouseover', function(e) {
	      			markerVideo.openPopup();
	      		});

	      		marker.on('click', function(e) {
        			map.panTo(marker.getLatLng());
    			});
    			markerVideo.on('click', function(e) {
        			map.panTo(marker.getLatLng());
    			});

    			map.fitBounds(markers.getBounds());

	      		$('.loading').remove();

		    });
		}
});

