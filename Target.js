define(['PhysicsSystem', 'ShaderProcessor', 'CircleEntity'], function(PhysicsSystem, ShaderProcessor, CircleEntity){

    function Target(id, canvasWidth, canvasHeight, gl, p_radius, numbolts, x, y, movementangle, speed){
        this._id = id;
        this._radius = p_radius;        
        this._previousStates = [];
        this._numPrevStates = 20;
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        
        this._serverTargetPositionX = 0, this._serverTargetPositionY = 0;
        
        this._physicsEntity = new CircleEntity("dynamic", x, y, canvasHeight, p_radius + 10, 1, 0, 1);
        
        this._currentMovementAngleInDeg = movementangle;
        this._speed = speed;
        this._xUnits = Math.cos(movementangle * (Math.PI / 180)) * speed;
        this._yUnits = Math.sin(movementangle * (Math.PI / 180)) * speed; 
        
        this.targetHandler = ShaderProcessor.requestTargetEffect(false, gl, 2, {x: [x], y: [y], radius: [p_radius], fluctuation: [20]});
        
        this._animationTime = 0;        
    }
    
    Target.prototype.draw = function(interpolation){       
        this.targetHandler.setPosition( this._prevX + (interpolation * (this._x - this._prevX)), this._prevY + (interpolation * (this._y - this._prevY)) );
        this._animationTime++;
        this.targetHandler.setTime(this._animationTime);
    }
    
    Target.prototype.update = function(){
        this.saveCurrentState();
        
        this._physicsEntity.update();        
        this._setXWithInterpolation(this._physicsEntity.getX());
        this._setYWithInterpolation(this._physicsEntity.getY());
    }
    
    Target.prototype.serverUpdate = function(newX, newY, linearVelocityX, linearVelocityY){
        this._serverTargetPositionX = newX;
        this._serverTargetPositionY = newY;

        if(!this._checkWithPastAndCurrentStatesAndDeleteAnyIrrelevant(newX, newY)){
            //logs message in case newX and newY don't match with any previous states
            console.log("SERVER COORDINATES IN THE FUTURE! AT: " + Date.now());

            this._previousStates = [];

            this._setXWithInterpolation(newX);
            this._setYWithInterpolation(newY);

            this._physicsEntity.setX(newX + this._radius);
            this._physicsEntity.setY(newY + this._radius);
        }
    }
    
    Target.prototype.setPosition = function(newX, newY){
        this._x = this._prevX = newX;  
        this._y = this._prevY = newY;
        this._physicsEntity.setPosition(newX, newY);
    }
    
    Target.prototype._setXWithInterpolation = function(newX){
        this._prevX = this._x;
        this._x = newX;
    }
    
    Target.prototype._setYWithInterpolation = function(newY){
        this._prevY = this._y;
        this._y = newY;
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
        this._physicsEntity.setLinearVelocity(this._xUnits, this._yUnits);
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
    
    Target.prototype.addToPhysicsSimulation = function(){
        this._physicsEntity.addToSimulation();
        this.targetHandler.shouldDraw(true);
    }
    
    Target.prototype.removeFromPhysicsSimulation = function(){
        this._physicsEntity.removeFromSimulation();
        this.targetHandler.shouldDraw(false);
    }
    
    Target.prototype.saveCurrentState = function(){
        if(this._previousStates.length >= this._numPrevStates){
            this._previousStates.splice(0, 1);
        }
        this._previousStates.push({x: this._x, y: this._y});
    }
    
    Target.prototype.getPastState = function(index){
        return this._previousStates[index - 1];
    }
    
    Target.prototype._checkWithPastAndCurrentStatesAndDeleteAnyIrrelevant = function(x, y){
        //testing
        return true;
        
        //check if passed in arg. match with current state
        if(x === this._x && y === this._y){
            this._previousStates = [];
            return true;
        }
        
        //check if passed in arg. match with any past state
        for(var i = 0; i < this._previousStates.length; i++){
            if(x === this._previousStates[i].x && y === this._previousStates[i].y){
                this._previousStates.splice(0, i + 1);
                return true;
            }    
        }
        
        //there was no match so all past states considered to be irrelevant, therefore all past states deleted
        this._previousStates = [];
        
        //no match for arg. passed in found with current or previous states, therefore return false
        return false;
    }
    
    //testing - display a lot of physics info in relation to this target
    Target.prototype._displayPhysicsBodyInfo = function(){
        console.log("Linear Damping: " + this._physicsEntity._body.GetLinearDamping());
        console.log("Inertia: " + this._physicsEntity._body.GetInertia());
        console.log("Angular Damping: " + this._physicsEntity._body.GetAngularDamping());
        console.log("Angular Velocity: " + this._physicsEntity._body.GetAngularVelocity());
        console.log("Mass: " + this._physicsEntity._body.GetMass());
    }
    
    Target.prototype._drawTargetFromServerPosition = function(context){
    }
    
    return Target;
    
});