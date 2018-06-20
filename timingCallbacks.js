define(['Custom Utility/Timer'], function(Timer){
    var timingEventObjs = [];
    
    function addTimingEvent(obj, timeToStopUpdates, updateFunc, callback){
        var timer = new Timer();
        timer.start();
        
        var timingEventObj = {
            obj: obj,
            timeToStopUpdates: timeToStopUpdates,
            timer: timer,
            updateFunc: updateFunc,
            callback: callback
        };
        
        timingEventObjs.push(timingEventObj);
    }
    
    function modifyStopTimeOfAddedTimingEvent(obj, newTime){
        for(var i = 0; i < timingEventObjs.length; i++){
            if(timingEventObjs.obj === obj){
                timingEventObjs.timeToStopUpdates = newTime;
            }
        }
    }    
    
    function resetTimeOfAddedTimeEvent(obj){
        for(var i = 0; i < timingEventObjs.length; i++){
            if(timingEventObjs[i].obj === obj){
                timingEventObjs[i].timer.reset();
                timingEventObjs[i].timer.start();
            }
        }
    }
    
    function removeTimingEvent(obj, shouldCallCallbackOrNot){
        for(var i = 0; i < timingEventObjs.length; i++){
            if(timingEventObjs[i].obj === obj){
                if(shouldCallCallbackOrNot){
                    timingEventObjs[i].callback.call(timingEventObjs[i].obj);
                }
                timingEventObjs.splice(i, 1);
                break;
            }
        }
    }
    
    function update(){
        for(var i = 0; i < timingEventObjs.length; i++){
            if(timingEventObjs[i].timer.getTime() > timingEventObjs[i].timeToStopUpdates){
                timingEventObjs[i].callback.call(timingEventObjs[i].obj);
                timingEventObjs.splice(i, 1);
                i--;
            }else{
                timingEventObjs[i].updateFunc.call(timingEventObjs[i].obj, timingEventObjs[i].timer.getTime());  
            }
        }
    }
    
    return {
        addTimingEvent: addTimingEvent,
        update: update,
        modifyStopTimeOfAddedTimingEvent: modifyStopTimeOfAddedTimingEvent,
        resetTimeOfAddedTimeEvent: resetTimeOfAddedTimeEvent,
        removeTimingEvent: removeTimingEvent
    };
});