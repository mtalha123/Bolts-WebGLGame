/*
    FPSCounter can be used by the client by first creating an object (Object.create(FPSCounter)), and then by calling
    the start() and end() methods, FPSCounter will give the FPS for the code inbetween the start() and end() method calls.
    FPSCounter is supposed to be used in a loop for it to work. 
    
    ONE CAVEAT: FPSCounter will give the correct FPS for the code between the two method calls ONLY if the
                start() method is called at the beginning of the loop and the end() method is called at end
                of loop. 
*/

define(['Custom Utility/Timer'], function(Timer){
    return {
        counter : 0,
        started : false,
        FPS : 0,
        timer : new Timer(),
        //checks if started. If not, started is set to true and timer is also started.
        start : function(){
            if(!this.started){
                this.started = true;
                this.timer.start();
            }
        },
        end : function(){
            //checks if one second has passed (which means the FPS value is now held in the counter variable)
            if(this.timer.getTime() >= 1000){
                //set FPS to the counter var
                this.FPS = this.counter;
                this.counter = 0;
                //timer restarts for the next calculation of FPS for the next second
                this.timer.reset();
                this.started = false;
            }else{
                this.counter++;
            }
        },
        //returns the FPS value
        getFPS : function(){
            return this.FPS;  
        },
        //resets the FPSCounter
        reset: function(){
            this.started = false;
            this.counter = 0;
            this.FPS = 0;
            this.timer.reset();
        }
    };
});