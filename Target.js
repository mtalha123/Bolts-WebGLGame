define(['LightningPiece', 'Box2DStuff'], function(LightningPiece, Box2DStuff){

    function Target(id, canvasWidth, canvasHeight, p_radius, numbolts, x, y, movementangle, speed){
        this._id = id;
        this._radius = p_radius;        
        var numLightningBolts = numbolts;
        var currentAngle = 0;
        var angleIncrement = 360 / numLightningBolts;
        var lightningCoordinates = [];
        var xOnCircle;
        var yOnCircle;
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        this._targetBody;
        
        this._bodyDef = new Box2DStuff.b2BodyDef();
        this._bodyDef.position.Set((x * Box2DStuff.scale) + (p_radius * Box2DStuff.scale), (y * Box2DStuff.scale) + (p_radius * Box2DStuff.scale));
        this._bodyDef.type = Box2DStuff.b2Body.b2_dynamicBody;   
        //Uncommenting the following line will set all the targets to be "bullet bodies", meaning they will not overlap (the collision will be more accurate). **REDUCES PERFORMANCE***
       // this._bodyDef.bullet = true;        
        this._fixtureDef = new Box2DStuff.b2FixtureDef();
        this._fixtureDef.density = 1;
        this._fixtureDef.friction = 0;
        this._fixtureDef.restitution = 1;
        this._fixtureDef.shape = new Box2DStuff.b2CircleShape(p_radius * Box2DStuff.scale);        
        
        this._currentMovementAngleInDeg = movementangle;
        this._speed = speed;
        this._xUnits = Math.cos(movementangle * (Math.PI / 180)) * speed;
        this._yUnits = Math.sin(movementangle * (Math.PI / 180)) * speed;        
        this._velocityVector = new Box2DStuff.b2Vec2(this._xUnits, this._yUnits);
        
        for(var i = 0; i < numLightningBolts; i++){
            xOnCircle = (Math.cos(currentAngle * (Math.PI / 180)) * this._radius) + (x + this._radius);
            yOnCircle = (Math.sin(currentAngle * (Math.PI / 180)) * this._radius) + (y + this._radius);
                        
            lightningCoordinates.push([x + this._radius, y + this._radius, xOnCircle, yOnCircle]);
            currentAngle += angleIncrement;
            
        }       
                
        this._lightning = new LightningPiece(canvasWidth, canvasHeight, lightningCoordinates, 8, 5, {lineWidth: 1});
        
    }
    
    Target.prototype.draw = function(context, interpolation){
        this._lightning.setX(this._prevX + (interpolation * (this._x - this._prevX)));
        this._lightning.setY(this._prevY + (interpolation * (this._y - this._prevY)));
        
        this._lightning.draw(context, interpolation, 0, 0);
        
        context.save();
        
        context.strokeStyle = "blue";
        context.shadowBlur = 20;
        context.shadowColor = "#004CFF";
        context.lineWidth = 3;
        context.beginPath();
        //context.arc((this._x + this._radius) + (this._xUnits * interpolation), (this._y + this._radius) + (this._yUnits * interpolation), this._radius, 0, 2 * Math.PI, false);
        
        //drawing with interpolation
        context.arc((this._prevX + (interpolation * (this._x - this._prevX))) + this._radius, (this._prevY + (interpolation * (this._y - this._prevY))) + this._radius, this._radius, 0, 2 * Math.PI, false);
        
        //uncomment the following line to draw without interpolation
        //context.arc(this._x + this._radius, this._y + this._radius, this._radius, 0, 2 * Math.PI, false);
        context.stroke(); 
        
        context.restore();
    }
    
    Target.prototype.update = function(){
        this._prevX = this._x;
        this._prevY = this._y;
        this._x = (this._targetBody.GetPosition().x / Box2DStuff.scale) - this._radius;
        this._y = (this._targetBody.GetPosition().y / Box2DStuff.scale) - this._radius;
        
        this._lightning.update();
       // this._lightning.setX(this._x);
        //this._lightning.setY(this._y);

    }
    
    Target.prototype.setX = function(newX){
        this._x = this._prevX = newX;
        this._lightning.setX(newX);
        
        this._targetBody.SetPosition(new Box2DStuff.b2Vec2(this._x * Box2DStuff.scale, this._y * Box2DStuff.scale));
    }
    
    Target.prototype.setY = function(newY){
        this._y = this._prevY = newY;
        this._lightning.setY(newY);
        
        this._targetBody.SetPosition(new Box2DStuff.b2Vec2(this._x * Box2DStuff.scale, this._y * Box2DStuff.scale));
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
        this._velocityVector.Set(this._xUnits, this._yUnits);
        this._targetBody.SetLinearVelocity(this._velocityVector);
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
        this._targetBody = Box2DStuff.physicsWorld.CreateBody(this._bodyDef);
        this._targetBody.CreateFixture(this._fixtureDef);
        this._targetBody.SetUserData(this);
        this._targetBody.SetLinearVelocity(this._velocityVector);
    }
    
    Target.prototype.removeFromPhysicsSimulation = function(){
        Box2DStuff.physicsWorld.DestroyBody(this._targetBody);
    }
    
    return Target;
    
});