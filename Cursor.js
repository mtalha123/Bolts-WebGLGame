define(['Custom Utility/Timer', 'EventSystem'], function(Timer, EventSystem){
    
    var x = 0, y = 0; 
    var mouseHeldDown = false;  
    var radius = 20;
    EventSystem.register(recieveEvent, "combo_level_increased");
    EventSystem.register(recieveEvent, "combo_level_reset");
    var handler = null;
    var appMetaData;
    
    function initialize(gl, p_appMetaData, EffectsManager){
        appMetaData = p_appMetaData;
        handler = EffectsManager.requestCursorEffect(true, 100, {}, gl, 100, 100);
        handler.shouldDraw(true);
    }
    
    function draw(interpolation){
        if(mouseHeldDown){
            handler.setClicked(true);
        }else{
            handler.setClicked(false);
        } 
        handler.setPosition(x, y);
        handler.update();
    }
    
    function isMouseButtonHeldDown(){
        return mouseHeldDown;
    }
    
    function getX(){
        return x;
    }
    
    function getY(){
        return y;
    }
    
    function changePosition(p_x, p_y){
        x = p_x;
        y = p_y;
    }
    
    function press(){
        mouseHeldDown = true;
    }
    
    function release(){
        mouseHeldDown = false;
    }
    
    function recieveEvent(eventInfo){
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
        getX: getX,
        getY: getY,
        changePosition: changePosition,
        press: press,
        release: release,
        isMouseButtonHeldDown: isMouseButtonHeldDown
    }
});