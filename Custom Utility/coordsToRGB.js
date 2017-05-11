define(['Custom Utility/map'], function(map){
    function nearestHigherPow2(value){
        var closestPow2 = Math.pow( 2, Math.round( Math.log( value ) / Math.log( 2 ) ) ); 
        if(closestPow2 < value){
            closestPow2 *= 2;
        }
        return closestPow2;
    }
    
    function coordsToRGB(coords, canvasWidth, canvasHeight){
        var numVertices = coords.length / 2;
        var closestUpperPowerOf2 = nearestHigherPow2(numVertices); 
        var coordsInRGB = [];
        
        var coordsInRGBCounter = 0;
        for(var i = 0; i < coords.length - 1; i+=2){
            coordsInRGB[coordsInRGBCounter] = map(0, canvasWidth, 0, 255, coords[i]);
            coordsInRGB[coordsInRGBCounter+1] = map(0, canvasHeight, 0, 255, coords[i+1]);   
            coordsInRGB[coordsInRGBCounter+2] = 0; //insert 0 into the 'B' component
            coordsInRGBCounter+=3;
        }

        for(var b = 0; b < Math.abs(numVertices - closestUpperPowerOf2); b++){
            coordsInRGB.push(0);
            coordsInRGB.push(0);
            coordsInRGB.push(0);
        }        
        return coordsInRGB;
    }
    
    return coordsToRGB;
});