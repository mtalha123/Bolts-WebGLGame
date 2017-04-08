define(['Custom Utility/map'], function(map){
    function nearestPow2(value){
        return Math.pow( 2, Math.round( Math.log( value ) / Math.log( 2 ) ) ); 
    }
    
    function coordsToRGB(coords, canvasWidth, canvasHeight){
        var numVertices = coords.length / 2;
        var closestPowerOf2 = nearestPow2(numVertices);    

        for(var i = 0; i < coords.length - 1; i+=3){
            coords[i] = map(0, canvasWidth, 0, 255, coords[i]);
            coords[i+1] = map(0, canvasHeight, 0, 255, coords[i+1]);                    
            coords.splice(i+2, 0, 0);
        }
        for(var b = 0; b < Math.abs(numVertices - closestPowerOf2); b++){
            coords.push(0);
            coords.push(0);
            coords.push(0);
        }        
        
        return coords;
    }
    
    return coordsToRGB;
});