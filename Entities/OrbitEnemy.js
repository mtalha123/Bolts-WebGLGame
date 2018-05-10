define(['CirclePhysicsBody', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'EventSystem', 'RingAlgorithm', 'MainTargetsPositions', 'Custom Utility/rotateCoord'], function(CirclePhysicsBody, Entity, CircularHitBoxWithAlgorithm, Vector, EventSystem, RingAlgorithm, MainTargetsPositions, rotateCoord){
    
    function OrbitEnemy(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position, 0, 0);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius * 1.5, new RingAlgorithm(position, p_radius * 2, canvasHeight * 0.2, gl, EffectsManager));
        
        this._handler = EffectsManager.requestOrbitEnemy(false, gl, 20, position, {radius: [this._radius]});
                 
        this._charge = 0;
        this._maxCharge = 4;
        this._captureArea = this._radius * 3;
        this._nextCapturePosition = new Vector(this._position.getX() + this._captureArea, this._position.getY());
        this._rotationSpeed = 10;
        this._capturedEntities = [];
    }

    //inherit from Entity
    OrbitEnemy.prototype = Object.create(Entity.Entity.prototype);
    OrbitEnemy.prototype.constructor = OrbitEnemy;
    
    OrbitEnemy.prototype.getRadius = function(){
        return this._radius;
    }
    
    OrbitEnemy.prototype.setPosition = function(newPosition){
        this._position = this._prevPosition = newPosition; 
        this._handler.setPosition(newPosition);
        this._hitBox.setPosition(newPosition);
        this._nextCapturePosition = new Vector(this._position.getX() + this._captureArea, this._position.getY());
    }
    
    OrbitEnemy.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newPosition);        
        this._nextCapturePosition = new Vector(this._position.getX() + this._captureArea, this._position.getY());
        this._hitBox.setPosition(newPosition);
    }
    
    OrbitEnemy.prototype.reset = function(){
        Entity.Entity.prototype.reset.call(this);
        this._charge = 0;
        this._hitBox.resetAlgorithm();
        this._nextCapturePosition = new Vector(this._position.getX() + this._captureArea, this._position.getY());
        this._capturedEntities = [];
    } 
    
    OrbitEnemy.prototype.update = function(){
        var angleIncrement = this._rotationSpeed / this._captureArea; // Get from Arc Length = radius * theta formula, where theta is angle in radians.
        this._nextCapturePosition = rotateCoord(this._nextCapturePosition, angleIncrement, this._position);   
        
        var allTargetObjs = MainTargetsPositions.getAllTargetObjs();
        
        for(var i = 0; i < allTargetObjs.length; i++){
            console.log("charge: " + this._charge);
            if(this._charge >= this._maxCharge){
                break;
            }
            
            if(allTargetObjs[i].target.getCharge() === 1 && this._position.distanceTo(allTargetObjs[i].position) <= this._captureArea){
                // DO CAPTURE EFFECT HERE
                this._charge++;
                this._capturedEntities.push(allTargetObjs[i].target);
                EventSystem.publishEventImmediately("entity_captured", {entity: allTargetObjs[i].target, capture_type: "orbit", 
                                                                        center: this._position, 
                                                                        radius: this._captureArea, 
                                                                        capture_position: this._nextCapturePosition,
                                                                        rotationSpeed: this._rotationSpeed});
                this._nextCapturePosition = rotateCoord(this._nextCapturePosition, Math.PI / 2, this._position);
            }
        }
    }
    
    OrbitEnemy.prototype.prepareForDrawing = function(interpolation){
        Entity.Entity.prototype.prepareForDrawing.call(this, interpolation);
        this._hitBox.prepareForDrawing(interpolation);
    }
    
    OrbitEnemy.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitBox.processInput(mouseInputObj)){
            for(var i = 0; i < this._capturedEntities.length; i++){
                EventSystem.publishEventImmediately("captured_entity_released", {entity: this._capturedEntities[i]});
            }
            this.destroyAndReset(callback);
            return true;
        }
        
        return false;
    }
    
    return OrbitEnemy;
    
});