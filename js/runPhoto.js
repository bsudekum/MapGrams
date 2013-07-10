function runPhotos(photos){
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
  					var caption = '-';
  				}
  				
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
							
				// if(includePhoto){
					markers.addLayer(marker);	
				// }

		        if(photos.data[num].videos){
		        	markers.addLayer(markerVideo);
		        }

		        markers.options.iconCreateFunction = function(cluster){
		        	for(i=1;i<cluster.getChildCount();i++){
		        		if (i==10) break;
		        		var cl ='<img src="' + cluster.getAllChildMarkers()[i].options.icon.options.iconUrl + '"/>';
		        		var cls = cl + cls
		        	}

		        	return new L.DivIcon({
		        		html: cls ,
		        		className: 'cluster-image',
		        		iconAnchor:[40,20]
		        	});
		        }
		        
	      		map.addLayer(markers);

	      		marker.on('mouseover', function(e) {
	      				marker.openPopup();
	      		});
	      		markerVideo.on('mouseover', function(e) {
	      				markerVideo.openPopup();
	      		});

	      		$('.loading').remove();

		    });
		}