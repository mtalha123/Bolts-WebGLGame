//Uses the STATE design pattern
//prototypes of the objects are being used in order to maximize performance. By using prototypes, all the methods are shared when multiple objects are created


define(['EventSystem'], function(EventSystem){
    function StartedState(Timer){
        this.timer = Timer;
    }
    StartedState.prototype = {
        start : function(offset){
            // timer already started, don't do anything
        },
        getTime : function(){
            return Date.now() - this.timer._startTime; 
        },
        stop : function(){
            this.timer._timeWhenStopped = Date.now();
            this.timer._state = this.timer._stoppedState;
        }
    };
    
    function StoppedState(Timer){
        this.timer = Timer;
    }
    StoppedState.prototype = {
        start : function(offset){
            this.timer._startTime = Date.now() - (this.timer._timeWhenStopped - this.timer._startTime);
            this.timer._state = this.timer._startedState;
        },
        getTime : function(){
            return this.timer._timeWhenStopped - this.timer._startTime;
        },
        stop : function(){
            // doesn't do anything because it's already in StoppedState
        }
    };
    
    function NotStartedState(Timer){
        this.timer = Timer;
    }
    NotStartedState.prototype = {
        start : function(){
            this.timer._startTime = Date.now();
            this.timer._started = true;
            this.timer._state = this.timer._startedState;
        },
        getTime : function(){
            return 0;
        },
        stop : function(){
            // doesn't do anything because Timer hasn't started yet
        }
    };
                
    
    function Timer(){
        this._startTime = 0;
        this._timeWhenStopped = 0;        
        this._started = false;
        
        this._notStartedState = new NotStartedState(this);
        this._startedState = new StartedState(this);
        this._stoppedState = new StoppedState(this);    
        this._state = this._notStartedState;
        
        EventSystem.register(this.receiveEvent, "game_pause", this);
        EventSystem.register(this.receiveEvent, "game_resume", this);
    }
    Timer.prototype = {
        //starts the timer
        start: function(){
            this._state.start();
        },
        //gets the time in MILLSECONDS
        getTime: function(){
           // console.log(this.state);
            return this._state.getTime();
        },
        //stops the timer but does not reset it (i.e. getTime() can still be called to get the time between start() and end())
        stop: function(){
           this._state.stop();
        },
        //resets the timer
        reset: function(){
            this._startTime = 0;
            this._timeWhenStopped = 0;
            this._started = false;
            this._state = this._notStartedState;
        },
        
        receiveEvent: function(eventInfo){
            if(eventInfo.eventType === "game_pause"){
                if(this._started){
                    this._state.stop();
                }
            }else if(eventInfo.eventType === "game_resume"){
                if(this._started){
                    this._state.start();
                }
            }
        }
    }
    
    return Timer;
   
        
});