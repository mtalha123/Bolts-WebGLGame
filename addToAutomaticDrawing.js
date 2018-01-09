define(['Custom Utility/Timer'], function(Timer){
    var automaticUpdatesObjs = [];
    
    function addToAutomaticDrawing(obj, timeToStopUpdates, updateFunc, callback){
        var timer = new Timer();
        timer.start();
        
        var handlerObj = {
            obj: obj,
            timeToStopUpdates: timeToStopUpdates,
            timer: timer,
            updateFunc: updateFunc,
            callback: callback
        };
        
        automaticUpdatesObjs.push(handlerObj);
    }
    
    function prepareForDrawing(){
        for(var i = 0; i < automaticUpdatesObjs.length; i++){
            if(automaticUpdatesObjs[i].timer.getTime() > automaticUpdatesObjs[i].timeToStopUpdates){
                automaticUpdatesObjs[i].callback.call(automaticUpdatesObjs[i].obj);
                automaticUpdatesObjs.splice(i, 1);
            }else{
                automaticUpdatesObjs[i].updateFunc.call(automaticUpdatesObjs[i].obj, automaticUpdatesObjs[i].timer.getTime());  
            }
        }
    }
    
    return {
        addToAutomaticDrawing: addToAutomaticDrawing,
        prepareForDrawing: prepareForDrawing
    };
});