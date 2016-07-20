define(['LightningPiece.js'], function(LightningPiece){

    function Target(id, canvasWidth, canvasHeight, p_radius, numbolts, x, y, movementangle, speed){
        this._id = id;
        this._radius = p_radius;        
        var numLightningBolts = numbolts;
        var currentAngle = 0;
        var angleIncrement = 360 / numLightningBolts;
        var lightningCoordinates = [];
        var xOnCircle;
        var yOnCircle;
        
        this._x = x, this._y = y;
        this._currentMovementAngleInDeg = movementangle;
        this._speed = speed;
        this._xUnits = Math.cos(movementangle * (Math.PI / 180)) * speed;
        this._yUnits = Math.sin(movementangle * (Math.PI / 180)) * speed;
        
        for(var i = 0; i < numLightningBolts; i++){
            xOnCircle = (Math.cos(currentAngle * (Math.PI / 180)) * this._radius) + (x + this._radius);
            yOnCircle = (Math.sin(currentAngle * (Math.PI / 180)) * this._radius) + (y + this._radius);
                        
            lightningCoordinates.push([x + this._radius, y + this._radius, xOnCircle, yOnCircle]);
            currentAngle += angleIncrement;
            
        }       
                
        this._lightning = new LightningPiece(canvasWidth, canvasHeight, lightningCoordinates, 8, 5, {lineWidth: 1});
        
    }
    
    Target.prototype.draw = function(context, interpolation){
        this._lightning.draw(context, interpolation, this._xUnits, this._yUnits);
        
        context.save();
        
        context.strokeStyle = "blue";
        context.shadowBlur = 20;
        context.shadowColor = "#004CFF";
        context.lineWidth = 3;
        context.beginPath();
        context.arc((this._x + this._radius) + (this._xUnits * interpolation), (this._y + this._radius) + (this._yUnits * interpolation), this._radius, 0, 2 * Math.PI, false);
        context.stroke(); 
        
        context.restore();
    }
    
    Target.prototype.update = function(){
        this._x += this._xUnits;
        this._y += this._yUnits;
        
        this._lightning.update();
        this._lightning.setX(this._x);
        this._lightning.setY(this._y);
    }
    
    Target.prototype.setX = function(newX){
        this._x = newX;
        this._lightning.setX(newX);
    }
    
    Target.prototype.setY = function(newY){
        this._y = newY;
        this._lightning.setY(newY);
    }
    
    Target.prototype.getX = function(){
        return this._x;
    }
    
    Target.prototype.getY = function(){
        return this._y;
    }
    
    Target.prototype.setMovementAngle = function(newAngle){
        this._currentMovementAngleInDeg = newAngle;
        this._xUnits = Math.cos(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
        this._yUnits = Math.sin(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
    }
    
     Target.prototype.getMovementAngle = function(){
        return this._currentMovementAngleInDeg;
    }
    
    Target.prototype.getRadius = function(){
        return this._radius;
    }
    
    Target.prototype.getId = function(){
        return this._id;
    }
    
    return Target;
    
});