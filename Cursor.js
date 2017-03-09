define(['Custom Utility/Timer', 'EventSystem'], function(Timer, EventSystem){
    
    var x = 0, y = 0; 
    var mouseHeldDown = false;  
    var radius = 20;
    EventSystem.register(recieveEvent, "combo_level_changed");
    
    function draw(context, interpolation){
        context.save();
        
        context.fillStyle = "rgba(50, 50, 50, 0.5)";
        context.strokeStyle = "black";
        context.lineWidth = .5;
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
        
        context.fillStyle = "yellow";
        context.beginPath();
        context.arc(x, y, 2, 0, 2 * Math.PI, false);
        context.fill();
        
        if(mouseHeldDown){
            context.fillStyle = "rgba(255, 0, 0, 0.3)";
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI, false);
            context.fill();
        }
        
        context.restore();
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
        draw : draw,
        getX: getX,
        getY: getY,
        changePosition: changePosition,
        press: press,
        release: release,
        isMouseButtonHeldDown: isMouseButtonHeldDown
    }
});