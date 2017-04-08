define(['Custom Utility/map'], function(map){
    function convertToGLCoorindate(coord){
        return map(0, 1, -1, 1, coord);
    }
    
    return convertToGLCoorindate;
});