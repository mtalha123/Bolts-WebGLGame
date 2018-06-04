define(['Custom Utility/rotateCoord', 'Custom Utility/Vector', 'Custom Utility/CircularHitBoxWithAlgorithm'], function(rotateCoord, Vector, CircularHitBoxWithAlgorithm){    
    function CircularHitRegions(centerPosition){
        this._centerPositionOfAllRegions = centerPosition;
        this._regions = [];
        this._labelCounter = 1;
    }
    
    CircularHitRegions.prototype.addRegion = function(centerPosition, radius, algorithm){
        var hitbox = new CircularHitBoxWithAlgorithm(centerPosition, radius, algorithm, this._labelCounter);
        this._regions.push(hitbox);
        
        this._labelCounter++;
    }
    
    CircularHitRegions.prototype.isInAnyRegion = function(checkPosition){
        for(var i = 0; i < this._regions.length; i++){
            if(this._regions[i].activated && this._regions[i].isInRegion(checkPosition)){
                return this._regions[i];
            }
        }
        
        return false;
    }
    
    CircularHitRegions.prototype.processInput = function(mouseInputObj){
        for(var i = 0; i < this._regions.length; i++){
            if(this._regions[i].processInput(mouseInputObj)){
                return this._regions[i];
            }            
        }
        
        return false;
    }
    
    CircularHitRegions.prototype.setPosition = function(newPosition){        
        var positionDiff = newPosition.subtract(this._centerPositionOfAllRegions);
        
        this._centerPositionOfAllRegions = this._centerPositionOfAllRegions.addTo(positionDiff);
        
        for(var i = 0; i < this._regions.length; i++){
            var currentRegionPosition = this._regions[i].getPosition();
            this._regions[i].setPosition(currentRegionPosition.addTo(positionDiff));
        }
    }
    
    CircularHitRegions.prototype.getPosition = function(){
        return this._centerPositionOfAllRegions;
    }
    
    CircularHitRegions.prototype.getRegions = function(){
        return this._regions;
    }
    
    CircularHitRegions.prototype.rotateAllRegions = function(angle){
        for(var i = 0; i < this._regions.length; i++){
            var currRegion = this._regions[i];
            var currPos = currRegion.getPosition();
            var newPos = rotateCoord(currPos, angle, this._centerPositionOfAllRegions);
            currRegion.setPosition(newPos);
        }
    }
    
    CircularHitRegions.prototype.activateAllRegions = function(){
        this._regions = this._regions.map(function(currValue){
            currValue.activated = true;
            currValue.resetAlgorithm();
            return currValue;
        });
    }
    
    CircularHitRegions.prototype.resetAllRegions = function(){
        for(var i = 0; i < this._regions.length; i++){
            this._regions[i].resetAlgorithm();
        }    
    }
    
    
    return CircularHitRegions;
});