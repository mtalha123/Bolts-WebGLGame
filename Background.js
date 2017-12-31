define(['EventSystem'], function(EventSystem){
    var handler;
    EventSystem.register(receiveEvent, "entity_destroyed");
    
    function initialize(gl, EffectsManager){
        handler = EffectsManager.requestBackgroundFieldEffect(false, gl, -10, {});
    }
    
    function draw(){
        handler.shouldDraw(false);
        handler.update();
    }
    
    function receiveEvent(eventInfo){
        handler.doEffect();
    }
    
    return {
        initialize: initialize,
        draw: draw
    };    
});