define([''], function(){
    
    var allTimers = [];
    var timeUncertainty = undefined;
    
    function initialize(timeuncertainty){
        timeUncertainty = timeuncertainty;
    }
    
    function getTimer(){
        var syncTimer = new SynchronizedTimer();
        allTimers.push(syncTimer);
        return syncTimer;
    }
    
    function updateAllTimers(){
        for(var i = 0; i < allTimers.length; i++){
            if(allTimers[i].isStarted() === true){
                allTimers[i].setTime(allTimers[i].getTime() + timeUncertainty);   
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
        initialize: initialize,
        getTimer: getTimer,
        updateAllTimers: updateAllTimers
    };
    
});

