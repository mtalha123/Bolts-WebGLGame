define([''], function(){
    
    var allTimers = [];
    
    function getTimer(){
        var syncTimer = new SynchronizedTimer();
        allTimers.push(syncTimer);
        return syncTimer;
    }
    
    function updateAllTimers(timeMillis){
        for(var i = 0; i < allTimers.length; i++){
            if(allTimers[i].isStarted() === true){
                allTimers[i].setTime(allTimers[i].getTime() + timeMillis);   
            }
        }
    }
    
    function SynchronizedTimer(){
        this._started = false;
        this._currentTime = 0;
    }
    
    SynchronizedTimer.prototype.start = function(){
        this._started = true;
    }
    
    SynchronizedTimer.prototype.getTime = function(){
        return this._currentTime;
    }
    
    SynchronizedTimer.prototype.setTime = function(newTime){
        this._currentTime = newTime;
    }
    
    SynchronizedTimer.prototype.stop = function(){
        this._started = false;
    }
    
    SynchronizedTimer.prototype.reset = function(){
        this._started = false;
        this._currentTime = 0;
    }
    
    SynchronizedTimer.prototype.isStarted = function(){
        return this._started;
    }
    
    return {
        getTimer: getTimer,
        updateAllTimers: updateAllTimers
    };
    
});

