define([''], function(){
    
    var x = 0, y = 0;
    
    function draw(context, interpolation, radius){
        context.save();
        
        context.fillStyle = "rgba(50, 50, 50, 0.5)";
        context.strokeStyle = "black";
        context.lineWidth = .5;
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
        context.restore();
    }
    
    function useCoordinates(p_x, p_y){
        x = p_x;
        y = p_y;
    }
    
    return {
        draw : draw,
        useCoordinates: useCoordinates
    }
});