define(['Custom Utility/Timer', 'EventSystem', 'Custom Utility/Vector'], function(Timer, EventSystem, Vector){
    
    var position = new Vector(0, 0);
    var mouseHeldDown = false;  
    var radius = 20;
    EventSystem.register(receiveEvent, "combo_level_increased");
    EventSystem.register(receiveEvent, "combo_level_reset");
    var handler = null;
    var appMetaData;
    
    function initialize(gl, p_appMetaData, EffectsManager){
        appMetaData = p_appMetaData;
        handler = EffectsManager.requestCursorEffect(false, 100, {}, gl, new Vector(100, 100));
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
    
    function receiveEvent(eventInfo){
        switch(eventInfo.eventData.comboLevel){
            case 0:
                radius = 20;
                break;
            case 1:
                radius = 23;
                break;
            case 2:
                radius = 26;
                break;
            case 3:
                radius = 29;
                break;
            case 4:
                radius = 32;
                break;
            case 5:
                radius = 35;
                break;
            case 6:
                radius = 38;
                break;
            case 7:
                radius = 41;
                break;
            case 8:
                radius = 44;
                break;
            
        }
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