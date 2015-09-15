$.getScript('https://cdn.rawgit.com/DragonCzz/plug.dj-scripts/master/libs/download.js');
var fileText = "", delay = (API.getUser().gRole >= 3 ? 100 : 3500);

if(typeof settings === 'undefined'){
    
    settings = {
        logToConsole: true, //Will log to console
        logToChat: true,    //Will log to chat
        logToFile: true,    //Will output log to file
    }
}

doLogging("SC song search started.");
$.get('https://plug.dj/_/playlists', function(data){
    data.data.forEach(function(e, i, a){
        if(i + 1 == a.length){
            setTimeout(function(){
                doLogging("SC song search finished.");
                if(settings.logToFile) download(fileText, "plug.dj sc songs.txt", "text/plain");
            }, delay * a.length + 2000)
        }
        setTimeout(function(){
            $.get("https://plug.dj/_/playlists/" + e.id + "/media", function(data){
                data.data.forEach(function(ee, ii, aa){
                    if(ee.format === 2) SC.get("/tracks/" + ee.cid, function(data){
                        doLogging("\n[Playlist #" + (i + 1) + "/" + a.length + "] Found SC '" + ee.author + " - " + ee.title);
                        doLogging("URL: " + data.permalink_url);
                    })
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
