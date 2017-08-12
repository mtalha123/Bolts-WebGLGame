define(['Custom Utility/distance'], function(distance){
    function CircularHitBox(centerX, centerY, radius){
        this._centerX = centerX;
        this._centerY = centerY;
        this._radius = radius;
    }
    
    CircularHitBox.prototype.isInRegion = function(checkX, checkY){
        if( distance(checkX, checkY, this._centerX, this._centerY) <= this._radius ){
            return true;
        }
        
        return false;
    }
    
    CircularHitBox.prototype.setPosition = function(newX, newY){
        this._centerX = newX;
        this._centerY = newY;
    }
    
    CircularHitBox.prototype.getPosition = function(){
        var x = this._centerX;
        var y = this._centerY;
        return [x, y];
    }
    
    function CircularHitRegions(centerXOfAllRegions, centerYOfAllRegions){
        this._centerX = centerXOfAllRegions;
        this._centerY = centerYOfAllRegions;
        this._regions = [];
    }
    
    CircularHitRegions.prototype.addRegion = function(centerX, centerY, radius){
        var hitbox = new CircularHitBox(centerX, centerY, radius);
        this._regions.push(hitbox);
    }
    
    CircularHitRegions.prototype.isInAnyRegion = function(checkX, checkY){
        for(var i = 0; i < this._regions.length; i++){
            if(this._regions[i].isInRegion(checkX, checkY)){
                return this._regions[i];
            }
        }
        
        return false;
    }
    
    CircularHitRegions.prototype.setPosition = function(newX, newY){        
        var xDiff = newX - this._centerX;
        var yDiff = newY - this._centerY;
        
        this._centerX += xDiff;
        this._centerY += yDiff;
        
        for(var i = 0; i < this._regions.length; i++){
            var currentRegionPosition = this._regions[i].getPosition();
            this._regions[i].setPosition(currentRegionPosition[0] + xDiff, currentRegionPosition[1] + yDiff);
        }
    }
    
    return CircularHitRegions;
});