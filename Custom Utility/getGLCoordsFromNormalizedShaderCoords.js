define(['Custom Utility/map'], function(map){
    function getGLCoordsFromNormalizedShaderCoords(normalizedShaderCoords){
        var GLCoords = [];
        for(var i = 0; i < normalizedShaderCoords.length; i++){
            GLCoords[i] = map(0, 1, -1, 1, normalizedShaderCoords[i]);
        }
        
        return GLCoords;
    }
    
    return getGLCoordsFromNormalizedShaderCoords;
});