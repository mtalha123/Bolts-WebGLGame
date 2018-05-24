define(['Custom Utility/Timer', 'EventSystem', 'Custom Utility/Vector'], function(Timer, EventSystem, Vector){
    
    var position = new Vector(0, 0);
    var mouseHeldDown = false;  
    var radius;
    var handler;
    var appMetaData;
    
    function initialize(gl, p_appMetaData, EffectsManager){
        appMetaData = p_appMetaData;
        handler = EffectsManager.requestCursorEffect(false, 100, {}, gl, new Vector(100, 100));
        radius = 0.02 * p_appMetaData.getCanvasHeight();
    }
    
    function draw(interpolation){
        handler.shouldDraw(true);
        if(mouseHeldDown){
            handler.setClicked(true);
        }else{
            handler.setClicked(false);
        } 
        handler.setPosition(position);
        handler.update();
    }
    
    function isMouseButtonHeldDown(){
        return mouseHeldDown;
    }
    
    function getPosition(){
        return position;
    }
    
    function changePosition(newPosition){
        position = newPosition;
    }
    
    function press(){
        mouseHeldDown = true;
    }
    
    function release(){
        mouseHeldDown = false;
    }
    
    return {
        initialize: initialize,
        draw : draw,
        getPosition: getPosition,
        changePosition: changePosition,
        press: press,
        release: release,
        isMouseButtonHeldDown: isMouseButtonHeldDown
    }
});