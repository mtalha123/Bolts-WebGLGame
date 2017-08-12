define(['EventSystem'], function(EventSystem){
    var handler;
    EventSystem.register(recieveEvent, "entity_destroyed");
    
    function initialize(gl, EffectsManager){
        handler = EffectsManager.requestBackgroundFieldEffect(true, gl, -10, {});
    }
    
    function draw(){
        handler.update();
    }
    
    function recieveEvent(eventInfo){
        handler.doEffect();
    }
    
    return {
        initialize: initialize,
        draw: draw
    };    
});