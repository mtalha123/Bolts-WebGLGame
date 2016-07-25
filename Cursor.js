define(['Custom Utility/Timer'], function(Timer){
    
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
    
    function mouseMove(event){
        x = event.clientX;
        y = event.clientY;
    }
    
    function mouseDown(event){
        mouseHeldDown = true;
    }
    
    function mouseUp(event){
        mouseHeldDown = false;
    }
    
    return {
        draw : draw,
        getX: getX,
        getY: getY,
        isMouseButtonHeldDown: isMouseButtonHeldDown,
        mouseMove: mouseMove,
        mouseDown: mouseDown,
        mouseUp: mouseUp
    }
});