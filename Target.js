define(['LightningPiece', 'PhysicsSystem', 'ShaderProcessor', 'ShaderLibrary'], function(LightningPiece, PhysicsSystem, ShaderProcessor, ShaderLibrary){

    function Target(id, canvasWidth, canvasHeight, p_radius, numbolts, x, y, movementangle, speed){
        this._id = id;
        this._radius = p_radius;        
        this._previousStates = [];
        this._numPrevStates = 20;
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        
        this._serverTargetPositionX = 0, this._serverTargetPositionY = 0;
        
        this._physicsEntity = PhysicsSystem.requestPhysicsEntity("dynamic");
        this._physicsEntity.createCircle(p_radius + 10, 1, 0, 1);
        
        this._currentMovementAngleInDeg = movementangle;
        this._speed = speed;
        this._xUnits = Math.cos(movementangle * (Math.PI / 180)) * speed;
        this._yUnits = Math.sin(movementangle * (Math.PI / 180)) * speed; 
        
        var numLightningBolts = numbolts;
        var currentAngle = 0;
        var angleIncrement = 360 / numLightningBolts;
        var lightningCoordinates = [];
        var xOnCircle;
        var yOnCircle; 
        
        this.targetHandler = ShaderProcessor.requestEffect(ShaderLibrary.TARGET);
        this.targetHandler.setResolution(canvasWidth, canvasHeight);
        this.targetHandler.setRadius(this._radius);
        this.targetHandler.setX(x);
        this.targetHandler.setY(y);
        this.targetHandler.setFluctuation(20);
        
        this.TESTTIME = 0;
        
//        for(var i = 0; i < numLightningBolts; i++){
//            xOnCircle = (Math.cos(currentAngle * (Math.PI / 180)) * this._radius) + (x + this._radius);
//            yOnCircle = (Math.sin(currentAngle * (Math.PI / 180)) * this._radius) + (y + this._radius);
//                        
//            lightningCoordinates.push([x + this._radius, y + this._radius, xOnCircle, yOnCircle]);
//            currentAngle += angleIncrement;
//            
//        }       
//                
//        this._lightning = new LightningPiece(canvasWidth, canvasHeight, lightningCoordinates, 8, 5, {lineWidth: 1});
        
    }
    
    Target.prototype.draw = function(context, interpolation){
//        this._lightning.setX(this._prevX + (interpolation * (this._x - this._prevX)));
//        this._lightning.setY(this._prevY + (interpolation * (this._y - this._prevY)));
//        
//        this._lightning.draw(context, interpolation, 0, 0);
//        
//        context.save();
//        
//        context.strokeStyle = "blue";
//        context.shadowBlur = 20;
//        context.shadowColor = "#004CFF";
//        context.lineWidth = 3;
//        context.beginPath();
//        //context.arc((this._x + this._radius) + (this._xUnits * interpolation), (this._y + this._radius) + (this._yUnits * interpolation), this._radius, 0, 2 * Math.PI, false);
//        
//        //drawing with interpolation
//        //context.arc((this._prevX + (interpolation * (this._x - this._prevX))) + this._radius, (this._prevY + (interpolation * (this._y - this._prevY))) + this._radius, this._radius, 0, 2 * Math.PI, false);
//        
//        //uncomment the following line to draw without interpolation
//        context.arc(this._x + this._radius, this._y + this._radius, this._radius, 0, 2 * Math.PI, false);
//        
//        context.stroke();
//        
//        //this._drawTargetFromServerPosition(context);
//     
//        context.restore();

        this.targetHandler.setX(this._x + this._radius);
        this.targetHandler.setY(this._y + this._radius);
        this.TESTTIME++;
        this.targetHandler.setTime(this.TESTTIME);
    }
    
    Target.prototype.update = function(){
        this.saveCurrentState();
        
        this._setXWithInterpolation(this._physicsEntity.getX() - this._radius);
        this._setYWithInterpolation(this._physicsEntity.getY() - this._radius);
        
        //use below line to display all physics information for this target (e.g. velocity, angular vel., etc.)
       // this._displayPhysicsBodyInfo();
        
       // this._lightning.update();

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
    
    Target.prototype.setX = function(newX){
        this._x = this._prevX = newX;
       // this._lightning.setX(newX);
        
        this._physicsEntity.setX(this._x + this._radius);
    }
    
    Target.prototype.setY = function(newY){
        this._y = this._prevY = newY;
        //this._lightning.setY(newY);

        this._physicsEntity.setY(this._y + this._radius);    
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
        PhysicsSystem.addToSimulation(this._physicsEntity);
        this.targetHandler.shouldDraw(true);
    }
    
    Target.prototype.removeFromPhysicsSimulation = function(){
        PhysicsSystem.removeEntityFromSimulation(this._physicsEntity);
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
        context.save();
        
        context.strokeStyle = "red";
        context.beginPath();
        context.arc(this._serverTargetPositionX + this._radius, this._serverTargetPositionY + this._radius, this._radius, 0, 2 * Math.PI, false);
        context.stroke();
        
        context.restore();
    }
    
    return Target;
    
});