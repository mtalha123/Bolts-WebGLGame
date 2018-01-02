define(['SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsBody', 'SliceAlgorithm', 'MainTargetsPositions'], function(SynchronizedTimers, MovingEntity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsBody, SliceAlgorithm, MainTargetsPositions){

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
    
    
    function TriangularTarget(canvasWidth, canvasHeight, gl, p_radius, position, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, movementangle, speed);    
        
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(position);
        var firstRegion = new Vector(position.getX() + p_radius, position.getY());
        var secondRegion = rotateCoord(new Vector(position.getX() + p_radius, position.getY()), Math.PI - (Math.PI/3), position);
        var thirdRegion = rotateCoord(new Vector(position.getX() + p_radius, position.getY()), Math.PI + (Math.PI/3), position);
        this._hitBoxRegions.addRegion(firstRegion, p_radius / 3, new SliceAlgorithm(firstRegion, p_radius / 3, gl, EffectsManager));
        this._hitBoxRegions.addRegion(secondRegion, p_radius / 3, new SliceAlgorithm(secondRegion, p_radius / 3, gl, EffectsManager));
        this._hitBoxRegions.addRegion(thirdRegion, p_radius / 3, new SliceAlgorithm(thirdRegion, p_radius / 3, gl, EffectsManager));
        
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestTriangularTargetEffect(false, gl, 20, position, {radius: [p_radius]});
        
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
    
    TriangularTarget.prototype.setPosition = function(newPosition){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newPosition);
        
        this._hitBoxRegions.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TriangularTarget.prototype._setPositionWithInterpolation = function(newPosition){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitBoxRegions.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TriangularTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0];
        MainTargetsPositions.removeTargetObj(this);
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
            this._handler.increaseLgGlowFactor(1.5);
            possibleHitBox.activated = false;
        }
        
        return false;
    }
    
    TriangularTarget.prototype.spawn = function(callback){        
        this._hitBoxRegions.activateAllRegions();
        MainTargetsPositions.addTargetObj(this, this._position);
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
    }
    
    return TriangularTarget;
    
});