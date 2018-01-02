define(['Custom Utility/Vector'], function(Vector){
    function rotateCoord(point, angle, center){
        var pointRelToOrigin = point.subtract(center);
        var rotatedCoordX = (pointRelToOrigin.getX() * Math.cos(angle)) - (pointRelToOrigin.getY() * Math.sin(angle));
        var rotatedCoordY = (pointRelToOrigin.getX() * Math.sin(angle)) + (pointRelToOrigin.getY() * Math.cos(angle));
        var rotatedCoord = new Vector(rotatedCoordX, rotatedCoordY);
        
        return center.addTo(rotatedCoord);
    }
    
    return rotateCoord;
});