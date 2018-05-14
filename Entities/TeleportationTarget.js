define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'Custom Utility/Timer', 'Custom Utility/Random', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'Border'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, Vector, Timer, Random, SliceAlgorithm, MainTargetsPositions, EventSystem, Border){

    function TeleportationTarget(canvasWidth, canvasHeight, gl, p_radius, position, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, movementangle, speed);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, EffectsManager));
        
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestTeleportationTargetHandler(false, gl, 2, position, {radius: [p_radius]});  
        
        this._timer = new Timer();
        this._timeForAppearanceOrDisappearance = 2000;
        this._visible = false;
        this._appearanceLeftBoundary = 0.3 * canvasWidth;
        this._appearanceRightBoundary = 0.7 * canvasWidth;
        this._appearanceTopBoundary = 0.6 * canvasHeight;
        this._appearanceBottomBoundary = 0.4 * canvasHeight;
        
        this._charge = 3;
    }
    
    //inherit from MovingEntity
    TeleportationTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    TeleportationTarget.prototype.constructor = TeleportationTarget;
    
    TeleportationTarget.prototype.getRadius = function(){
        return this._radius;
    }
    
    TeleportationTarget.prototype.setPosition = function(newPosition){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TeleportationTarget.prototype._setPositionWithInterpolation = function(newPosition){                
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TeleportationTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        MainTargetsPositions.removeTargetObj(this);
        this._hitBox.resetAlgorithm();
        this._visible = false;
        this._timer.reset();
    }
    
    TeleportationTarget.prototype.spawn = function(callback){
        MainTargetsPositions.addTargetObj(this, this._position);
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
        this._timer.start();
        this._visible = true;
    }
    
    TeleportationTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){  
        if(this._visible){
            if(this._hitBox.processInput(mouseInputObj)){
                this.destroyAndReset(callback);
                return true;
            }
        }
    }
    
    TeleportationTarget.prototype.destroyAndReset = function(callback){
        MovingEntity.MovingEntity.prototype.destroyAndReset.call(this, callback);
        MainTargetsPositions.removeTargetObj(this);
    }
    
    TeleportationTarget.prototype.update = function(){
        MovingEntity.MovingEntity.prototype.update.call(this);
        
        // get closest distance to a border edge
        var closestDist = Math.min( this._position.distanceTo(new Vector(Border.getLeftX(), this._position.getY())),
                                    this._position.distanceTo(new Vector(this._position.getX(), Border.getTopY())),                                 
                                    this._position.distanceTo(new Vector(Border.getRightX(), this._position.getY())),
                                    this._position.distanceTo(new Vector(this._position.getX(), Border.getBottomY()))
                                  );
        
        if(this._timer.getTime() > this._timeForAppearanceOrDisappearance){
            if(this._visible){
                if(closestDist > this._radius * 4){
                    this._handler.disappear(this._velocity.getNormalized());
                    this._visible = false;
                    this._timer.reset();
                    this._timer.start();
                }
            }else{
                var newPosition = new Vector(Random.getRandomInt(this._appearanceLeftBoundary, this._appearanceRightBoundary),
                                             Random.getRandomInt(this._appearanceBottomBoundary, this._appearanceTopBoundary));
                this.setPosition(newPosition);
                this._handler.appear(this._velocity.getNormalized());
                this._visible = true;
                this._timer.reset();
                this._timer.start();
            }
        }
    }
    
    return TeleportationTarget;
    
});