define([], function(){
    function getVertices(x, y, width, height){
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
    
    return getVertices;
});