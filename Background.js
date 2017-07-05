define(['SynchronizedTimers', 'EventSystem'], function(SynchronizedTimers, EventSystem){
    var handler;
    var time = 1;
    var timerForEffect = SynchronizedTimers.getTimer();
    var effectDuration = 1000;
    EventSystem.register(recieveEvent, "target_destroyed");
    
    function initialize(gl, ShaderProcessor){
        handler = ShaderProcessor.requestBackgroundFieldEffect(true, gl, -10, {});
    }
    
    function draw(){
        time+=0.01;
        handler.setTime(time);
        handler.setCompletion(timerForEffect.getTime() / effectDuration);
        if(timerForEffect.getTime() >= effectDuration){
            timerForEffect.reset();
        }
    }
    
    function recieveEvent(eventInfo){
        timerForEffect.start();
    }
    
    return {
        initialize: initialize,
        draw: draw
    };    
});