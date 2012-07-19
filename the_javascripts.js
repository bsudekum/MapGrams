var map = new L.Map('map'),
    tiles = new L.TileLayer('http://a.tiles.mapbox.com/v3/bobbysud.map-94xylfrd/{z}/{x}/{y}.png', {maxZoom: 17}),
    popup = new L.Popup(),
    clientId = 'f62cd3b9e9a54a8fb18f7e122abc52df',
    circle;

map.setView(new L.LatLng(37.790794553924414, -122.44709014892578), 13).addLayer(tiles);

map.on('click', onMapClick);

popup.setContent("<div id='instagram-photo'></div><p id='instagram-caption'></p>");

function onMapClick(e) {
    if (!circle) {
        circle = new L.Circle(e.latlng, 1000, {
            color: '#919191',
            fill: true,
            fillOpacity: 0.2,
            weight: 0
        });
        map.addLayer(circle)
    } else {
        circle.setLatLng(e.latlng);
    }
        
    popup.setLatLng(e.latlng);

    if (!map.hasLayer(popup)) {
        map.openPopup(popup);
    }

    $("#instagram-photo").instagram({
        search: {
            lat: e.latlng.lat.toFixed(2),
            lng: e.latlng.lng.toFixed(2)
        },
        show: 1,
        onload: 'Loading',
        clientId: clientId,
        onComplete: function(photos) {
            if (photos && photos.length > 0 && photos[0].caption && photos[0].caption.text) {
                $('#instagram-caption').text(photos[0].caption.text);
            }
        }
    });
}