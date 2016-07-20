define(['LightningPiece'], function(LightningPiece){
    
    var canvasWidth, canvasHeight, borderLightningPiece;
    
    var margin;
    
    var widthOfBlueThing;
    var heightOfBlueThing;
    
    function initialize(p_canvasWidth, p_canvasHeight){
        canvasWidth = p_canvasWidth;
        canvasHeight = p_canvasHeight;
        
        margin = 0.025 * canvasWidth;
        widthOfBlueThing = canvasWidth - (margin * 2);
        heightOfBlueThing = 50;
        
        var borderPath = [ // X                      Y
                          [ margin,                margin, 
                            canvasWidth - margin,  margin, 
                            canvasWidth - margin,  canvasHeight - margin, 
                            margin,                canvasHeight - margin,      
                            margin,                margin ]       
        ];
        
        borderLightningPiece = new LightningPiece(canvasWidth, canvasHeight, borderPath, 20, 20, {closePath: true});   
    }
    
    function draw(context, interpolation){
        borderLightningPiece.draw(context, interpolation, 0, 0);
        
    }
    
    function update(){
        borderLightningPiece.update();
    }
    
    function getLeftX(){
        return margin;
    }
    function getTopY(){
        return margin;
    }
    function getRightX(){
        return canvasWidth - margin;
    }
    function getBottomY(){
        return canvasHeight - margin;
    }
    
   
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        getLeftX: getLeftX,
        getTopY: getTopY,
        getRightX: getRightX,
        getBottomY: getBottomY
    }
});