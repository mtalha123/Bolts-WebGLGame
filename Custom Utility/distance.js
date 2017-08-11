define([''], function(){
    function distance(startX, startY, endX, endY){
        return Math.sqrt( Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2) );
    }
    
    return distance;
});