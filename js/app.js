$(function(){
		// $('.open-panel').click()
		var model = new Backbone.Model();

		var time = new Date().getTime()/1000-604800;//Max time back is 1 week. 604800 is 1 week.

		if($.cookie('token_cookie')){
			var token = $.cookie('token_cookie');
		}

		var fit = function(){
			map.fitBounds(markers.getBounds());	
		}
	
		if(location.hash.slice(1,7) == 'photo=' && location.hash.slice(0,7) !== '#access'){
			var photoId = location.hash.slice(7)
		}else if(location.hash.slice(1,6) == 'user='){
			var username = location.hash.slice(6)
		}else{
			var photoId = '';
		}

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
			token: token || '',
			username: username || '',
			photoId: photoId || ''
		});

		var sat = L.tileLayer('http://{s}.tiles.mapbox.com/v3/bobbysud.map-l4i2m7nd/{z}/{x}/{y}.png');
		var basemap = L.tileLayer('http://{s}.tiles.mapbox.com/v3/bobbysud.map-29smq0w6/{z}/{x}/{y}.png');
		var map = L.map('map',{
			fadeAnimation:false,
			maxZoom:19,
		}).addControl(L.mapbox.geocoderControl('examples.map-vyofok3q'));

		var hash = new L.Hash(map);
		if (!window.location.hash) {
		    map.setView([37.7818,-122.4203], 15);
		}

		map.addLayer(basemap);

		var markers = new L.MarkerClusterGroup({
			disableClusteringAtZoom:16,
			maxClusterRadius:50,
			animateAddingMarkers: false,
			showCoverageOnHover:false
		});

		var imgID = '';
		var hash = new L.Hash(map);
		
		map.attributionControl.addAttribution('<a href="http://visuallybs.com" targer=_blank>Bobby Sudekum</a>');

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

		var trashcan = L.Control.extend({
		    options: {
		        position: 'topleft'
		    },

		    onAdd: function (map) {
		        var tc = L.DomUtil.create('div', 'trashcan');
		        return tc;
		    }
		});
		map.addControl(new trashcan());
		$('.trashcan').append('<a href=""><img src="css/trashcan.png" width=11px height=11px /></a>')

		var ListView = Backbone.View.extend({
				el: $('body'),
				events: {
      			'click #map': 'addItem',
      			'change form': 'updateParam',
      			'click .locator': 'findLocation',
      			'click .sign-in': 'signIn',
      			'submit #user-form': 'getUserPhoto',
      			'click .trashcan': 'removePics',
      			'click form#maplayer': 'switchMap',
      			'click .text-close': 'closeText'
    		},
		
				initialize: function(){
					_.bindAll(this, 'render');
					this.render();
				},

				switchMap: function(){
					if($('#radio-choice-v-2b').is(':checked')){
							map.addLayer(basemap);
							map.removeLayer(sat);
						}else{
							map.addLayer(sat);
							map.removeLayer(basemap);
						}
				},

				closeText: function(e){
					e.preventDefault();
					$('.caption').fadeOut(300, function(){ $(this).remove();});
				},
		
				render: function(){
					if(photoId){
						
						$.ajax({
					      	type: 'GET',
							dataType: 'jsonp',
							cache: true,
							url: 'https://api.instagram.com/v1/media/' + photoId + '?access_token=11377329.52838ef.2f3389066ca54790ad67335ddb677f84',
							success: function (photos) {
								runPhoto(photos, fit)
							}
						});
					}else if(location.hash.length > 35 || $.cookie('token_cookie')) {
						
						var aToken = $.cookie('token_cookie') || location.hash.substr(1);
						$.cookie('token_cookie', aToken, { expires: 1 });
						
						model.set({
							token: aToken
						});

						$('.sign-in .ui-btn-text').html('Signed In')

						$.ajax({
					      	type: 'GET',
							dataType: 'jsonp',
							cache: true,
							url: 'https://api.instagram.com/v1/users/self/feed?' + aToken,
							success: function (photos) {
								runPhotos(photos, fit)
							}
						});
						console.log('logged in')
					}else if(username){
						var url = 'https://api.instagram.com/v1/users/search?q=' + username + '&' + 'access_token=11377329.52838ef.2f3389066ca54790ad67335ddb677f84'

						$.ajax({
					    	type: 'GET',
							dataType: 'jsonp',
							cache: true,
							url: url,
							success: function (user) {
								if(!user.data[0].id){
									alert('No username')
								}else{
								var user = user.data[0].id;
								
									$.ajax({
								    	type: 'GET',
										dataType: 'jsonp',
										cache: true,
										url: 'https://api.instagram.com/v1/users/' + user + '/media/recent/?access_token=11377329.52838ef.2f3389066ca54790ad67335ddb677f84',
										success: function (photos) {
											var userHash = photos.data[0].caption.from.username
											runPhotos(photos, fit)

											setTimeout(function(){
												window.location.hash ='#user=' + userHash
											},1000)
											
											if(photos.data.length<1){
												alert('No Photos For User')
											}
										}
									});
								}
							}
						});
					}else{
						console.log('not logged in')
					}
				},

				getUserName: function(e) {
					e.preventDefault()
				},

				getUserPhoto: function(e){
					e.preventDefault()
					if($('#radio-choice-v-2b').is(':checked')){
							var user = 'user'
						}else{
							var user = 'friend'
						}
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
						var photo = $('#photo').val();
						var dayMin = $('#range-10b').val();
						var dayMax = $('#range-10a').val();
						var u = $('#username').val();
						var secDay = 86400;
						var newMin = new Date().getTime()/1000 - (secDay * dayMin)
						var newMax = new Date().getTime()/1000 - (secDay * dayMax)

						if($('#cluster').val() == 'true'){
							var cluster = true;
						}else{
							var cluster = '';
						}

						model.set({
							video:video,
							photo:photo,
							clustering:cluster,
							radius:radius,
							likes: likes,
							max_timestamp: newMax,
							username: u
						});

						console.log(model.get('clustering'))
						var aToken = model.get('token')
						var userName = model.get('username');

						if(userName){

							var url = 'https://api.instagram.com/v1/users/search?q=' + userName + '&' + 'access_token=11377329.52838ef.2f3389066ca54790ad67335ddb677f84'

							$.ajax({
						    	type: 'GET',
								dataType: 'jsonp',
								cache: true,
								url: url,
								success: function (user) {
									if(!user.data[0].id){
										alert('No username')
									}else{
									var user = user.data[0].id;
									
										$.ajax({
									    	type: 'GET',
											dataType: 'jsonp',
											cache: true,
											url: 'https://api.instagram.com/v1/users/' + user + '/media/recent/?access_token=11377329.52838ef.2f3389066ca54790ad67335ddb677f84',
											success: function (photos) {
												var userHash = photos.data[0].caption.from.username
												runPhotos(photos, fit)

												setTimeout(function(){
													window.location.hash ='#user=' + userHash
												},1000)
												
												if(photos.data.length<1){
													alert('No Photos For User')
												}
											}
										});
									}
								}
							});

						}else{

							// if(aToken){
								var url = 'https://api.instagram.com/v1/users/self/feed?' + aToken;	
							// }else{
								// alert('please sign in first')
							// }

							$.ajax({
						    	type: 'GET',
								dataType: 'jsonp',
								cache: true,
								url: url,
								success: function (photos) {
									$('.sign-in .ui-btn-text').html("Signed in");
									runPhotos(photos,fit)
								}
							});

						}

						
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

				removePics: function(e) {
					e.preventDefault();
					// markers.clearLayers(marker);
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

				// $('.leaflet-overlay-pane svg g').fadeOut(300, function(){ $(this).remove();});

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
			    	icon:loadingIcon,
			    	clickable:false
			    }).addTo(map);
				
				var url = 'https://api.instagram.com/v1/media/search?lat=' + llat + '&lng=' + llng + '&distance=' + radius + '&min_timestamp=' + min_timestamp + '&max_timestamp=' + max_timestamp + '&client_id=5d1ba596dc034a7a8895e309f5f2452f&count=100';	
				
				return $.ajax({
		      	type: "GET",
			      dataType: "jsonp",
			      cache: true,
			      url: url,
			      success: function (photos) {
			      		runPhotos(photos)
			      		if(photos.data.length<1){
			      			map.removeLayer(loading);
			      			map.removeLayer(circle);
			      		}
			      		map.removeLayer(loading);
			      		map.removeLayer(circle);
			      }
		    });
		}

		map.on('click',getPhotos)

		function runPhotos(photos, fit){
			$.each(photos.data, function(num){
				var link = photos.data[num].link;
				var clusterOn = model.get('clustering');
  				var username = photos.data[num].user.username || '';
  				var profile = photos.data[num].user.profile_picture || '';
  				var imgUrl = photos.data[num].images.low_resolution.url || '';
  				var imgThumb = photos.data[num].images.thumbnail.url || '';
  				var imgId = photos.data[num].id || '';
  				var filter = 'filter - ' + photos.data[num].filter || '';
  				var video = model.get('video') || '';
				var includePhoto = model.get('photo') || '';
  				var date = $.timeago(new Date(parseInt(photos.data[num].created_time) * 1000)) || '';

  				if(photos.data[num].user.full_name){
  					var name = photos.data[num].user.full_name;
  				}else{
  					var name = '';
  				}
  				
  				if(photos.data[num].likes.count){
  					var likes = photos.data[num].likes.count;	
  				}else{
  					var likes = 0;
  				}

  				if(photos.data[num].location){
  					if(photos.data[num].location.latitude){
  						var lat = photos.data[num].location.latitude;
  						var lng = photos.data[num].location.longitude;
  						var show = true;
  					}

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
  					var caption = '';
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
      		    	className:'imgId-' + imgId
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
	      		    		'<p>' + likes + '<span class="heart"> ♥</span></p>' +
	      		    	'</div>'+
      		    	'</div>' +
      		    	'<div class="bottom-text">' +
	      		    	'<a href="' + link + '" target=_blank>'+
	      		    		'<video width="273" height="273" autoplay loop><source src="' + videoUrl + '" type="video/mp4">Your browser does not support the video tag.</video>'+
	      		    	'</a>'+
      		    		'<p class="caption">' + caption + '<span><a class="leaflet-popup-close-button text-close" href="#close">×</a></span></p>' +

      		    	'</div>',{
      		    	maxWidth:273,
      		    	minWidth: imgId,
      		    	autoPanPadding: new L.Point(5, 44),
      		    	autoPan: false
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
	      		    		'<p>' + likes + '<span class="heart"> ♥</span></p>' +
	      		    	'</div>'+
      		    	'</div>' +
      		    	'<div class="bottom-text">' +
	      		    	'<a href="' + link + '" target=_blank>'+
	      		    		'<img src="' + imgUrl + '" height="273px" width="273px"/>'+
	      		    	'</a>'+
      		    		'<p class="caption">' + caption + '<span><a class="leaflet-popup-close-button text-close" href="#close">×</a></span></p>' +

      		    	'</div>',{
      		    	maxWidth:273,
      		    	minWidth: imgId,
      		    	autoPanPadding: new L.Point(5, 44),
      		    	autoPan: false
      		    });
							
				if(includePhoto){
					markers.addLayer(marker);	
				}

		        if(photos.data[num].videos){
		        	markers.addLayer(markerVideo);
		        }
		        
	      		map.addLayer(markers);

  				if(clusterOn){
					markers.options.disableClusteringAtZoom = 16;
				}else{
					markers.options.disableClusteringAtZoom = 1;
				}
  				
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

    			if(fit){
    				map.fitBounds(markers.getBounds());	
    			}
    			$('.trashcan').click(function(){
    				markers.clearLayers(marker);	
    			});

		    });
			
			map.on('popupopen', function(e) {
				var imgID = e.popup.options.minWidth;
	  			window.location.hash ='#photo=' + imgID
	  		}).on('popupclose', function(e) {
				var imgID = '';
				window.location.hash = imgID
	  		});

		}

		function runPhoto(photos, fit){
			var username = photos.data.user.username;
			var link = photos.data.link;
			var profile = photos.data.user.profile_picture;
			var imgUrl = photos.data.images.low_resolution.url;
			var imgThumb = photos.data.images.thumbnail.url || '';
			var imgId = photos.data.id || '';
			var filter = 'filter - ' + photos.data.filter || '';
			var video = model.get('video') || '';
			var includePhoto = model.get('photo') || '';
			var date = $.timeago(new Date(parseInt(photos.data.created_time) * 1000)) || '';

			if(photos.data.user.full_name){
				var name = photos.data.user.full_name;
			}else{
				var name = '';
			}
			
			if(photos.data.likes.count){
				var likes = photos.data.likes.count;	
			}else{
				var likes = 0;
			}

			if(photos.data.location){
				
				var lat = photos.data.location.latitude;
				var lng = photos.data.location.longitude;
				var show = true;

				if(photos.data.location.name){
					var location = 'at ' + photos.data.location.name;
				}else{
					var location = '';
				}

			}else{
				var lat = 0;
				var lng = 0;
				var show = false;
			}

			if(photos.data.videos){
				var videoUrl = photos.data.videos.low_resolution.url;
			}

			if(photos.data.caption){
					var caption = photos.data.caption.text
			}else{
				var caption = '';
			}
			
			var imageIcon = L.icon({
				className: 'imgId-' + imgId,
			    iconUrl: imgThumb,
			    iconRetinaUrl: imgThumb,
			    iconSize: [40, 40],
			    iconAnchor: [20, 20],
			});

		    var marker = L.marker(new L.LatLng(lat,lng),{
		    	icon:imageIcon,
		    	className:'imgId-' + imgId
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
      		    		'<p>' + likes + '<span class="heart"> ♥</span></p>' +
      		    	'</div>'+
  		    	'</div>' +
  		    	'<div class="bottom-text">' +
      		    	'<a href="' + link + '" target=_blank>'+
      		    		'<video width="273" height="273" autoplay loop><source src="' + videoUrl + '" type="video/mp4">Your browser does not support the video tag.</video>'+
      		    	'</a>'+
  		    		'<p class="caption">' + caption + '<span><a class="leaflet-popup-close-button text-close" href="#close">×</a></span></p>' +

  		    	'</div>',{
  		    	maxWidth:273,
  		    	minWidth: imgId,
  		    	autoPanPadding: new L.Point(5, 44),
  		    	autoPan: false
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
      		    		'<p>' + likes + '<span class="heart"> ♥</span></p>' +
      		    	'</div>'+
  		    	'</div>' +
  		    	'<div class="bottom-text">' +
      		    	'<a href="' + link + '" target=_blank>'+
      		    		'<img src="' + imgUrl + '" height="273px" width="273px"/>'+
      		    	'</a>'+
  		    		'<p class="caption">' + caption + '<span><a class="leaflet-popup-close-button text-close" href="#close">×</a></span></p>' +

  		    	'</div>',{
  		    	maxWidth:273,
  		    	minWidth: imgId,
  		    	autoPanPadding: new L.Point(5, 44),
  		    	autoPan: false
		    });
					
		
        if(photos.data.videos){
        	markers.addLayer(markerVideo);
        }
        if(includePhoto){
			markers.addLayer(marker);	
		}
        
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

		if(fit){
			map.fitBounds(markers.getBounds());
		}
		map.panBy(new L.Point(0, 200));
		map.zoomOut();

		setTimeout(function(){
			marker.openPopup();	
			markerVideo.openPopup();	
		},1500)

		map.on('popupopen', function(e) {
			
			//remove empty caption
			if($('.caption').html().length == 81){
				$('.caption').fadeOut(300, function(){ $(this).remove();});
			}
			var imgID = e.popup.options.minWidth;
  			window.location.hash ='#photo=' + imgID
  		}).on('moveend', function(e) {
			var imgID = '';
  		});

	}
});