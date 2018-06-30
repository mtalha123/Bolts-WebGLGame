define(['Custom Utility/Timer'], function(Timer){
    var timingEventsObjs = [];
    
    function addTimingEvents(obj, timePerEvent, numTimesToRepeatEvent, updateFunc, callback){
        var timer = new Timer();
        timer.start();
        
        var timingEventObj = {
            obj: obj,
            timePerEvent: timePerEvent,
            timer: timer,
            updateFunc: updateFunc,
            callback: callback,
            numTimesToRepeatEvent: numTimesToRepeatEvent
        };
        
        timingEventsObjs.push(timingEventObj);
    }
    
    function modifyTimePerEvent(obj, newTime){
        for(var i = 0; i < timingEventsObjs.length; i++){
            if(timingEventsObjs.obj === obj){
                timingEventsObjs.timePerEvent = newTime;
            }
        }
    }    
    
    function resetTimeOfAddedTimeEvents(obj){
        for(var i = 0; i < timingEventsObjs.length; i++){
            if(timingEventsObjs[i].obj === obj){
                timingEventsObjs[i].timer.reset();
                timingEventsObjs[i].timer.start();
            }
        }
    }
    
    function removeTimingEvents(obj, shouldCallCallbackOrNot){
        for(var i = 0; i < timingEventsObjs.length; i++){
            if(timingEventsObjs[i].obj === obj){
                if(shouldCallCallbackOrNot){
                    timingEventsObjs[i].callback.call(timingEventsObjs[i].obj);
                }
                timingEventsObjs.splice(i, 1);
                break;
            }
        }
    }
    
    function update(){
        for(var i = 0; i < timingEventsObjs.length; i++){
            if(timingEventsObjs[i].timer.getTime() > timingEventsObjs[i].timePerEvent){
                timingEventsObjs[i].numTimesToRepeatEvent--;
                timingEventsObjs[i].timer.reset();
                timingEventsObjs[i].timer.start();
                if(timingEventsObjs[i].numTimesToRepeatEvent <= 0){
                    timingEventsObjs[i].callback.call(timingEventsObjs[i].obj);
                    timingEventsObjs.splice(i, 1);
                    i--;
                }
            }else{
                timingEventsObjs[i].updateFunc.call(timingEventsObjs[i].obj, timingEventsObjs[i].timer.getTime());  
            }
        }
    }
    
    return {
        addTimingEvents: addTimingEvents,
        update: update,
        modifyTimePerEvent: modifyTimePerEvent,
        resetTimeOfAddedTimeEvents: resetTimeOfAddedTimeEvents,
        removeTimingEvents: removeTimingEvents
    };
});