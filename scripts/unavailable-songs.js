$.getScript('https://cdn.rawgit.com/DragonCzz/plug.dj-scripts/master/libs/download.js');
var APIkey = 'AIzaSyDgGJ6aED-sENrI9zsEli9i4SVXTORfN5Q';
var unavailableMove = [], fileText = "", delay = (API.getUser().gRole >= 3 ? 100 : 3500);

if(typeof settings === 'undefined'){
    
    settings = {
        logToConsole: true, //Will log to console
        logToChat: true,    //Will log to chat
        logToFile: true,    //Will output log to file
        moveToTop: true,    //Will move all songs to top of the playlist
        moveToBottom: false,//Will not move all songs to bottom of the playlist
        remove: false,      //Will not remove the songs
    }
}

doLogging("Unavailable song search started.");
$.get('https://plug.dj/_/playlists', function(data){
    data.data.forEach(function(e, i, a){
        if(a.length == i + 1){
            setTimeout(function(){
                Object.keys(unavailableMove).forEach(function(ee, ii, aa){
                    setTimeout(function(){
                        if(settings.moveToTop || settings.moveToBottom) {
                            doLogging("[Media #" + (ii + 1) + "/" + aa.length + "] Moving a song to " + (settings.moveToTop ? "top" : "bottom") + " of the playlist...");
                            $.ajax({
                                type: 'PUT', 
                                url: 'https://plug.dj/_/playlists/' + ee + '/media/move', 
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                data: '{"ids":' + JSON.stringify(unavailableMove[ee]) + ',"beforeID":' + (settings.moveToTop ? "0" : "-1") + '}'
                            });
                        } else if (settings.remove){
                            doLogging("[Media #" + (ii + 1) + "/" + aa.length + "] Removing a song from the playlist...");
                            $.ajax({
                                type: 'POST', 
                                url: 'https://plug.dj/_/playlists/' + ee + '/media/delete', 
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                data: '{"ids":' + JSON.stringify(unavailableMove[ee]) + '}'   
                            });
                        }
                        if(ii + 1 == aa.length) {
                            doLogging("Unavailable song search finished.");
                            setTimeout(function(){
                                if(settings.logToFile) download(fileText, "plug.dj unavailable songs.txt", "text/plain");
                            }, aa.length * delay + 2000);
                        }
                    }, ii * delay)
                });
                if(Object.keys(unavailableMove).length == 0) {
                    doLogging("Unavailable song search finished.");
                }
            }, a.length * delay)
        }
        setTimeout(function(){
            doLogging("[Playlist #" + (i + 1) + "/" + a.length + "] Checking playlist '" + e.name + "'");
            $.get("https://plug.dj/_/playlists/" + e.id + "/media", function(data){
                data.data.forEach(function(ee, ii, aa){
                    $.get("https://www.googleapis.com/youtube/v3/videos?id=" + ee.cid + "&key=" + APIkey + "&part=snippet,status", function(data){
                        var passed = true;
                        if(ee.format == 1 && data.items.length == 0) {
                            doLogging("[Playlist #" + (i + 1) + "/" + a.length + "][YT] " + e.name + " (ID: " + e.id + "): " + ee.author + " - " + ee.title + " (CID: " + ee.cid + ")");
                            passed = false;
                            
                        } else if(ee.format == 2){
                            SC.get("/tracks/" + ee.cid, function (track){
                                if (typeof track.title === "undefined"){
                                    doLogging("[Playlist #" + (i + 1) + "/" + a.length + "][SC] " + e.name + " (ID: " + e.id + "): " + ee.author + " - " + ee.title + " (CID: " + ee.cid + ")");
                                    passed = false;
                                }
                            });
                        } else if(data.items.length == 1){
                            if(data.items[0].status.uploadStatus != "processed"){
                                doLogging("[Playlist #" + (i + 1) + "/" + a.length + "][YT] " + e.name + " (ID: " + e.id + "): " + ee.author + " - " + ee.title + " (CID: " + ee.cid + ")");
                                passed = false;
                            }
                        }
                        if(!passed){
                            if(unavailableMove[e.id] === undefined) {
                                unavailableMove[e.id] = [];
                            }
                            unavailableMove[e.id].push(ee.id);
                        }
                    });
                });
            });
        }, delay * i);
    });
});

function doLogging(text){
    if(settings.logToConsole) console.log(text);
    if(settings.logToChat) API.chatLog(text);
    if(settings.logToFile) fileText += text + "\n";
}
