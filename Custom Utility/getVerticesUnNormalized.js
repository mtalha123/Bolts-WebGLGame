define([], function(){
    function getVerticesUnNormalized(x, y, width, height){
        var vertices = [
            x + width, y,
            x, y,
            x, y + height,
            x, y + height,
            x + width, y + height,
            x + width, y
        ];
        
        return vertices;
    }
    
    return getVerticesUnNormalized;
});