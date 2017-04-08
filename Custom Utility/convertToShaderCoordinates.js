define([], function(){
    function convertToShaderCoords(coords, height){
        for(var i = 1; i < coords.length; i+=2){
            coords[i] = height - coords[i];
        }
    }
    
    return convertToShaderCoords;
});