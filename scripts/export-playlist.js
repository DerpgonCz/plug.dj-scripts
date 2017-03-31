$.getScript('https://cdn.rawgit.com/DragonCzz/plug.dj-scripts/master/libs/download.js', function() {

	$.ajax({
	   type: 'GET',
	   url: 'https://plug.dj/_/playlists',
	   contentType: 'application/json',
	   data: ''
	}).done(function(msg) {

		$.ajax({
			type: 'GET',
			url: 'https://plug.dj/_/playlists/' + msg.data.find(function(e) { return e.active; }).id + '/media',
			contentType: 'application/json',
			data: ''
		}).done(function(msg) {
			
			var out = msg.data.map(function(e, i) {
				
				if(e.format != 1)
					return null;

				return e.cid;
			});
			
			download(JSON.stringify(out), "Plug.dj Playlist Export.json", "text/plain")
		});
	});
});
