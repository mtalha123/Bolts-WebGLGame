define(['Custom Utility/distance'], function(distance){
    function dot(vector1, vector2){
        return (vector1.getX() * vector2.getX()) + (vector1.getY() * vector2.getY());
    }
    
    function Vector(x, y){
        this._x = x;
        this._y = y;
        this._magnitude = distance(0, 0, x, y);
    }
    
    Vector.prototype.getNormalized = function(){
        var normVector = new Vector(this._x / this._magnitude, this._y / this._magnitude);
        return normVector;
    }
    
    Vector.prototype.getMagnitude = function(){
        return this._magnitude;
    }
    
    Vector.prototype.addTo = function(vector){
        var vec = new Vector(this._x + vector.getX(), this._y + vector.getY());
        return vec;
    }
    
    Vector.prototype.subtract = function(vector){
        var vec = new Vector(this._x - vector.getX(), this._y - vector.getY());
        return vec;
    }
    
    Vector.prototype.multiplyWithScalar = function(scalar){
        var vec = new Vector(this._x * scalar, this._y * scalar);
        return vec;
    }
    
    Vector.prototype.projectOnto = function(vector){
        var unitVec = vector.getNormalized();
        var scalar = dot(this, unitVec) / dot(unitVec, unitVec);
        return unitVec.multiplyWithScalar(scalar);        
    }
    
    Vector.prototype.getX = function(){
        return this._x;
    }
    
    Vector.prototype.getY = function(){
        return this._y;
    }
    
    Vector.prototype.hasSameDirection = function(vector){
        var thisNorm = this.getNormalized();
        var otherVecNorm = vector.getNormalized();
        
        if( Math.round(thisNorm.getX()) === Math.round(otherVecNorm.getX()) ){
            if( Math.round(thisNorm.getY()) === Math.round(otherVecNorm.getY()) ){
                return true;
            }
        }
        
        return false;
    }
    
    Vector.prototype.getAngleBetweenThisAnd = function(vec){
        return Math.acos(dot(this, vec) / (this.getMagnitude() * vec.getMagnitude()));
    }
    
    Vector.prototype.distanceTo = function(vec){
        return Math.sqrt(Math.pow(this._x - vec.getX(), 2) + Math.pow(this._y - vec.getY(), 2));
    }
    
    Vector.prototype.setCoords = function(x, y){
        this._x = x;
        this._y = y;
    } 
    
    return Vector;
});