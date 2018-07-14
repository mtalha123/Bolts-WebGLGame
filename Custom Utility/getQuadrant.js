define([], function(){
    function getQuadrant(point, center){        
        var angle;
        var point_t = point.subtract(center);

        if(point_t.getX() == 0.0){
            if(point_t.getY() >= 0.0){
                angle = 90.0;
            }

            if(point_t.getY() < 0.0){
                angle = -90.0;
            }
        }

        angle = Math.atan2(point_t.getY(), point_t.getX());
        //convert to degrees
        angle *= (180 / Math.PI);

        if(angle < 0.0){
            angle = 180.0 + (180.0 - Math.abs(angle));
        }

        angle = parseInt(angle.toString());

        if(angle >= 0 && angle <= 90){
            return 1;
        }else if(angle >= 90 && angle < 180){
            return 2;
        }else if(angle >= 180 && angle < 270){
            return 3;            
        }else if(angle >= 270 && angle <= 360){
            return 4;           
        }    
    }
    
    return getQuadrant;
});