define(['SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsBody', 'SliceAlgorithm'], function(SynchronizedTimers, MovingEntity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsBody, SliceAlgorithm){

    function TriangularTargetDestructionState(targetHandler){
        MovingEntity.MovingEntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from MovingEntityDestructionState
    TriangularTargetDestructionState.prototype = Object.create(MovingEntity.MovingEntityDestructionState.prototype);
    TriangularTargetDestructionState.prototype.constructor = TriangularTargetDestructionState; 
    
    
    function TriangularTargetNormalState(target){
        MovingEntity.MovingEntityNormalState.call(this, target);
    }
    
    //inherit from MovingEntityNormalState
    TriangularTargetNormalState.prototype = Object.create(MovingEntity.MovingEntityNormalState.prototype);
    TriangularTargetNormalState.prototype.constructor = TriangularTargetNormalState;
    
    TriangularTargetNormalState.prototype.update = function(){
        MovingEntity.MovingEntityNormalState.prototype.update.call(this);
        
        this._entity._rotationAngle+=0.05;
        this._handler.setAngle(this._entity._rotationAngle);
        this._entity._hitBoxRegions.rotateAllRegions(0.05);
    }
    
    
    function TriangularTarget(id, canvasWidth, canvasHeight, gl, p_radius, x, y, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, id, canvasWidth, canvasHeight, gl, x, y, movementangle, speed);
        this._id = id;       
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(x, y);
        var firstRegion = new Vector(x + p_radius, y);
        var secondRegion = rotateCoord(new Vector(x + p_radius, y), Math.PI - (Math.PI/3), new Vector(x, y));
        var thirdRegion = rotateCoord(new Vector(x + p_radius, y), Math.PI + (Math.PI/3), new Vector(x, y));
        this._hitBoxRegions.addRegion(firstRegion.getX(), firstRegion.getY(), p_radius / 3, new SliceAlgorithm(firstRegion.getX(), firstRegion.getY(), p_radius / 3));
        this._hitBoxRegions.addRegion(secondRegion.getX(), secondRegion.getY(), p_radius / 3, new SliceAlgorithm(secondRegion.getX(), secondRegion.getY(), p_radius / 3));
        this._hitBoxRegions.addRegion(thirdRegion.getX(), thirdRegion.getY(), p_radius / 3, new SliceAlgorithm(thirdRegion.getX(), thirdRegion.getY(), p_radius / 3));
        
        this._physicsBody = new CirclePhysicsBody(x, y, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestTriangularTargetEffect(false, gl, 20, x, y, {radius: [p_radius]});
        
        this._normalState = new TriangularTargetNormalState(this);
        this._destructionState = new TriangularTargetDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._rotationAngle = 0;
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0];
    }
    
    //inherit from MovingEntity
    TriangularTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    TriangularTarget.prototype.constructor = TriangularTarget;
    
    TriangularTarget.prototype.setPosition = function(newX, newY){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    TriangularTarget.prototype._setPositionWithInterpolation = function(newX, newY){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    TriangularTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0];
    }
    
    TriangularTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        var possibleHitBox = this._hitBoxRegions.processInput(mouseInputObj);
        if(possibleHitBox){
            this._numGuardsActivated++;
            if(this._numGuardsActivated === 3){
                this._numGuardsActivated = 0;
                this._guardPrefs = [0, 0, 0];
                this._handler.setGuardPrefs(this._guardPrefs);
                this.destroyAndReset(callback);
                return true;   
            }

            this._guardPrefs[possibleHitBox.getLabel() - 1] = 1.0;
            this._handler.setGuardPrefs(this._guardPrefs);
            console.log("guardprefs: " + this._guardPrefs);
            this._handler.increaseLgGlowFactor(1.5);
            possibleHitBox.activated = false;
        }
        
        return false;
    }
    
    TriangularTarget.prototype.spawn = function(callback){
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
        this._hitBoxRegions.activateAllRegions();
    }
    
    return TriangularTarget;
    
});