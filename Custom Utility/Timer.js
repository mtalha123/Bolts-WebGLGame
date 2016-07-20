//Uses the STATE design pattern
//prototypes of the objects are being used in order to maximize performance. By using prototypes, all the methods are shared when multiple objects are created


define(function(){

    function StartedState(Timer){
        this.timer = Timer;
    }
    StartedState.prototype = {
        start : function(){
            // timer already started, don't do anything
        },
        getTime : function(){
            return Date.now() - this.timer._pastTime; 
        },
        end : function(){
            this.timer._currentTime = Date.now();
            this.timer._state = this.timer.stoppedState;
        }
    };
    
    function StoppedState(Timer){
        this.timer = Timer;
    }
    StoppedState.prototype = {
        start : function(){
            this.timer.__pastTime = Date.now() - (this.timer._currentTime - this.timer._pastTime);
            this.timer._state = this.timer._startedState;
        },
        getTime : function(){
            return this.timer._currentTime - this.timer._pastTime;
        },
        end : function(){
            // doesn't do anything because it's already in StoppedState
        }
    };
    
    function NotStartedState(Timer){
        this.timer = Timer;
    }
    NotStartedState.prototype = {
        start : function(){
            this.timer._pastTime = Date.now();
            this.timer._state = this.timer._startedState;
        },
        getTime : function(){
            return 0;
        },
        end : function(){
            // doesn't do anything because Timer hasn't started yet
        }
    };
                
    
    function Timer(){
        this._pastTime = 0;
        this._currentTime = 0;        
        this._offset = 0;
        
        this._notStartedState = new NotStartedState(this);
        this._startedState = new StartedState(this);
        this._stoppedState = new StoppedState(this);    
        this._state = this._notStartedState;
      
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
        end: function(){
           this._state.end();
        },
        //resets the timer
        reset: function(){
            this._pastTime = 0;
            this._currentTime = 0;
            this._started = false;
            this._state = this._notStartedState;
        } 
    }
    
    return Timer;
   
        
});