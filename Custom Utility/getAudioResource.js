define([''], function(){
    var loadAudioResource = function (url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            if (request.status < 200 || request.status > 299) {
                callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
            } else {
                callback(null, request.response);
            }
        };
        request.send();
    };
    
    return loadAudioResource;
});
