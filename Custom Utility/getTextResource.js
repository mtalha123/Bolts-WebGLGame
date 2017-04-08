define([''], function(){
    var loadTextResource = function (url, callback, extraInfo) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            if (request.status < 200 || request.status > 299) {
                callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
            } else {
                callback(null, request.responseText, extraInfo);
            }
        };
        request.send();
    };
    
    return loadTextResource;
});
