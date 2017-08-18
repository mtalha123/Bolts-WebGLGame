define(['Custom Utility/distance', 'Custom Utility/rotateCoord', 'Custom Utility/Vector'], function(distance, rotateCoord, Vector){
    function CircularHitBox(centerX, centerY, radius, label){
        this._centerX = centerX;
        this._centerY = centerY;
        this._radius = radius;
        this._label = label;
        this.activated = true;
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
    
    CircularHitBox.prototype.getLabel = function(){
        return this._label;
    }
    
    function CircularHitRegions(centerXOfAllRegions, centerYOfAllRegions){
        this._centerX = centerXOfAllRegions;
        this._centerY = centerYOfAllRegions;
        this._regions = [];
        this._labelCounter = 1;
    }
    
    CircularHitRegions.prototype.addRegion = function(centerX, centerY, radius){
        var hitbox = new CircularHitBox(centerX, centerY, radius, this._labelCounter);
        this._regions.push(hitbox);
        
        this._labelCounter++;
    }
    
    CircularHitRegions.prototype.isInAnyRegion = function(checkX, checkY){
        for(var i = 0; i < this._regions.length; i++){
            if(this._regions[i].activated && this._regions[i].isInRegion(checkX, checkY)){
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
    
    CircularHitRegions.prototype.getPosition = function(){
        return [this._centerX, this._centerY];
    }
    
    CircularHitRegions.prototype.getRegions = function(){
        return this._regions;
    }
    
    CircularHitRegions.prototype.rotateAllRegions = function(angle){
        for(var i = 0; i < this._regions.length; i++){
            var currRegion = this._regions[i];
            var currPos = currRegion.getPosition();
            var newPos = rotateCoord(new Vector(currPos[0], currPos[1]), angle, new Vector(this._centerX, this._centerY));
            currRegion.setPosition(newPos.getX(), newPos.getY());
        }
    }
    
    CircularHitRegions.prototype.activateAllRegions = function(){
        this._regions = this._regions.map(function(currValue){
            currValue.activated = true;
            return currValue;
        });
    }
    
    
    return CircularHitRegions;
});