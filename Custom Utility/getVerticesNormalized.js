define(['Custom Utility/getVerticesUnNormalized'], function(getVerticesUnNormalized){
    function getVerticesNormalized(x, y, width, height, canvasWidth, canvasHeight){
        var vertices = getVerticesUnNormalized(x, y, width, height);

        for(var a = 0; a < vertices.length - 1; a+=2){
            vertices[a] /= canvasWidth;
            vertices[a+1] /= canvasHeight;
        }
        
        return vertices;
    }
    
    return getVerticesNormalized;
});