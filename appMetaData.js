define([], function(){
    var canvasWidth, canvasHeight;
    
    function initialize(p_canvasWidth, p_canvasHeight){
        canvasWidth = p_canvasWidth;
        canvasHeight = p_canvasHeight;
    }
    
    function getCanvasWidth(){
        return canvasWidth;
    }
    
    function getCanvasHeight(){
        return canvasHeight;
    }
    
    return {
        initialize: initialize,
        getCanvasWidth: getCanvasWidth,
        getCanvasHeight: getCanvasHeight,
    };
});