define(['Custom Utility/Timer', 'EventSystem'], function(Timer, EventSystem){
    
    var x = 0, y = 0; 
    var mouseHeldDown = false;  
    
    function draw(context, interpolation, radius){
        context.save();
        
        context.fillStyle = "rgba(50, 50, 50, 0.5)";
        context.strokeStyle = "black";
        context.lineWidth = .5;
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
        
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