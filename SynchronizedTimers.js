define(['EventSystem'], function(EventSystem){
    
    var allTimers = [];
    EventSystem.register(receiveEvent, "game_pause");
    EventSystem.register(receiveEvent, "game_resume");
    
    function getTimer(){
        var syncTimer = new SynchronizedTimer();
        allTimers.push(syncTimer);
        return syncTimer;
    }
    
    function updateAllTimers(timeMillis){
        for(var i = 0; i < allTimers.length; i++){
            if(allTimers[i].isStarted() === true && allTimers[i].isStopped() === false){
                allTimers[i].setTime(allTimers[i].getTime() + timeMillis);   
            }
        }
    }
    
    function SynchronizedTimer(){
        this._started = false;
        this._stopped = false;
        this._currentTime = 0;
    }
    
    SynchronizedTimer.prototype.start = function(){
        this._started = true;
        this._stopped = false;
    }
    
    SynchronizedTimer.prototype.getTime = function(){
        return this._currentTime;
    }
    
    SynchronizedTimer.prototype.setTime = function(newTime){
        this._currentTime = newTime;
    }
    
    SynchronizedTimer.prototype.stop = function(){
        this._stopped = true;
    }
    
    SynchronizedTimer.prototype.reset = function(){
        this._started = false;
        this._stopped = false;
        this._currentTime = 0;
    }
    
    SynchronizedTimer.prototype.isStarted = function(){
        return this._started;
    }    
    
    SynchronizedTimer.prototype.isStopped = function(){
        return this._stopped;
    }
    
    function receiveEvent(eventInfo){
        if(eventInfo.eventType === "game_pause"){
            for(var i = 0; i < allTimers.length; i++){
                if(allTimers[i].isStarted()){
                    allTimers[i].stop();   
                }
            }
        }else if(eventInfo.eventType === "game_resume"){
            for(var i = 0; i < allTimers.length; i++){
                if(allTimers[i].isStarted()){
                    allTimers[i].start();   
                }   
            }
        }
    }
    
    return {
        getTimer: getTimer,
        updateAllTimers: updateAllTimers
    };
    
});

