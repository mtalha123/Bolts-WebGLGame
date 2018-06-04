define(['SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBox', 'Custom Utility/Vector', 'SliceAlgorithm', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Border', 'Custom Utility/Random', 'EventSystem'], function(SynchronizedTimers, Entity, CircularHitBox, Vector, SliceAlgorithm, CircularHitBoxWithAlgorithm, Border, Random, EventSystem){

    function BonusTargetOrb(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);     
        
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, canvasHeight, EffectsManager));
        this._handler = EffectsManager.requestLightningOrbEffect(false, gl, 20, position, {radius: [p_radius]});
        this._particlesHandler = EffectsManager.requestBasicParticleEffect(false, gl, 50, 30, new Vector(0, 0), {FXType: [2], maxLifetime: [100], radiusOfSource: [p_radius * 1.5]});
        this._particlesDestDist = 0.1 * canvasHeight;
        this._currParticlesDirection = "LEFT";
        this._currentStage = 1;
        this._nextOrbSpawnPosition = new Vector(0, 0);
    }
    
    //inherit from Entity
    BonusTargetOrb.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetOrb.prototype.constructor = BonusTargetOrb;
    
    BonusTargetOrb.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);
        this._hitBox.setPosition(newPosition);
        this._particlesHandler.setPosition(newPosition);
        this._setNextOrbSpawnDirection();
        this.setParticlesDirection(this._currParticlesDirection);
    }
    
    BonusTargetOrb.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newPosition);        
        this._hitBox.setPosition(newPosition);
        this._particlesHandler.setPosition(newPosition);
        this.setParticlesDirection(this._currParticlesDirection);
        this._setNextOrbSpawnDirection();
    }
   
    BonusTargetOrb.prototype.destroyAndReset = function(callback){
       this._handler.doDestroyEffect(this._position, function(){
            callback();
        });
        this._hitBox.resetAlgorithm();
        this._particlesHandler.reset();
        this._handler.shouldDraw(false);
    }
    
    BonusTargetOrb.prototype.prepareForDrawing = function(interpolation){
        Entity.Entity.prototype.prepareForDrawing.call(this, interpolation);
        this._particlesHandler.update();
    }
    
    BonusTargetOrb.prototype.spawn = function(callback){
        Entity.Entity.prototype.spawn.call(this, callback);
        this._particlesHandler.shouldDraw(true);
        this._handler.turnOnLightning();
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "bonus"});
    }
    
    BonusTargetOrb.prototype.setParticlesDirection = function(direction){
        this._currParticlesDirection = direction;
        
        if(direction === "LEFT"){
            this._particlesHandler.setDestinationForParticles(new Vector(this._position.getX() - this._particlesDestDist, this._position.getY()));
        }else if(direction === "UP"){
            this._particlesHandler.setDestinationForParticles(new Vector(this._position.getX(), this._position.getY() + this._particlesDestDist));
        }else if(direction === "RIGHT"){
            this._particlesHandler.setDestinationForParticles(new Vector(this._position.getX() + this._particlesDestDist, this._position.getY()));
        }else if(direction === "DOWN"){
            this._particlesHandler.setDestinationForParticles(new Vector(this._position.getX(), this._position.getY() - this._particlesDestDist));
        } 
    }
    
    BonusTargetOrb.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        if(this._hitBox.processInput(mouseInputObj)){
            if(this._currentStage < 4){
                this.destroyAndReset(function(){});
                this.setPosition(this._nextOrbSpawnPosition);
                this.spawn(function(){});
                if(this._currentStage === 3){
                    this._particlesHandler.shouldDraw(false);
                }
                this._currentStage++;
            }else if(this._currentStage === 4){
                this.destroyAndReset(function(){
                    this._currentStage = 1;
                    callback();
                }.bind(this));
                
                return true;
            }
        }
    }
    
    BonusTargetOrb.prototype._setNextOrbSpawnDirection = function(){
        var borderWalls = [];
        var position = this._position;
        
        if(position.distanceTo(new Vector(Border.getLeftX(), position.getY())) >= this._particlesDestDist * 2){
            borderWalls.push("LEFT");
        }        
        if(position.distanceTo(new Vector(position.getX(), Border.getTopY())) >= this._particlesDestDist * 2){
            borderWalls.push("UP");
        }        
        if(position.distanceTo(new Vector(Border.getRightX(), position.getY())) >= this._particlesDestDist * 2){
            borderWalls.push("RIGHT");
        }        
        if(position.distanceTo(new Vector(position.getX(), Border.getBottomY())) >= this._particlesDestDist * 2){
            borderWalls.push("DOWN");
        }
        
        var randomWall = borderWalls[Random.getRandomInt(0, borderWalls.length)];
        this.setParticlesDirection(randomWall);
        this._currParticlesDirection = randomWall;
        
        if(randomWall === "LEFT"){
            this._nextOrbSpawnPosition = new Vector(position.getX() - this._particlesDestDist, position.getY());
        }else if(randomWall === "UP"){
            this._nextOrbSpawnPosition = new Vector(position.getX(), position.getY() + this._particlesDestDist);
        }else if(randomWall === "RIGHT"){
            this._nextOrbSpawnPosition = new Vector(position.getX() + this._particlesDestDist, position.getY());
        }else if(randomWall === "DOWN"){
            this._nextOrbSpawnPosition = new Vector(position.getX(), position.getY() - this._particlesDestDist);
        } 
    }
    
    return BonusTargetOrb;
    
});