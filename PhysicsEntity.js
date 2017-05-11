define(['PhysicsSystem', 'Box2DStuff'], function(PhysicsSystem, Box2DStuff){
    function PhysicsEntity(bodyType, x, y, canvasHeight, density, friction, restitution){
        this._x = x;
        this._y = y;        
        this._bodyDef = new Box2DStuff.b2BodyDef();
        
        if(bodyType === "static"){
            this._bodyDef.type = Box2DStuff.b2Body.b2_staticBody;  
        }else if(bodyType === "dynamic"){
            this._bodyDef.type = Box2DStuff.b2Body.b2_dynamicBody;     
        } 
        //the following line will set all the targets to be "bullet bodies", meaning they will not overlap (the collision will be more accurate). **REDUCES PERFORMANCE***
        this._bodyDef.bullet = true;       
        this._bodyDef.fixedRotation = true;       
        this._body = undefined;
        this._isInSimulation = false;
        this._fixtureDef = new Box2DStuff.b2FixtureDef();
        this._fixtureDef.density = density;
        this._fixtureDef.friction = friction;
        this._fixtureDef.restitution = restitution;
        this._canvasHeight = canvasHeight;
    }
    
    PhysicsEntity.prototype.setPosition = function(newX, newY){
    }
    
    PhysicsEntity.prototype.getX = function(){
        return this._x;
    }
    
    PhysicsEntity.prototype.getY = function(){
        return this._y;
    }
    
    PhysicsEntity.prototype.getId = function(){
        return this._id;
    }
    
    PhysicsEntity.prototype.getBody = function(){
        return this._body;
    }
    
    PhysicsEntity.prototype.getBodyDefinition = function(){
        return this._bodyDef;
    }
    
    PhysicsEntity.prototype.setLinearVelocity = function(x, y){
        this._velocityVector = new Box2DStuff.b2Vec2(x, y);
        
        if(this._isInSimulation){
            this._body.SetLinearVelocity(new Box2DStuff.b2Vec2(this._velocityVector.x, -(this._velocityVector.y)));
        }else{
            this._bodyDef.linearVelocity = new Box2DStuff.b2Vec2(this._velocityVector.x, -(this._velocityVector.y));
        }
    }
    
    PhysicsEntity.prototype.getLinearVelocity = function(){
        if(this._isInSimulation){
            return this._body.GetLinearVelocity();
        }
    }
    
    PhysicsEntity.prototype.addToSimulation = function(){
        this._body = PhysicsSystem.addToSimulation(this);
        this._body.CreateFixture(this._fixtureDef);
        this._isInSimulation = true;
    }
    
    PhysicsEntity.prototype.removeFromSimulation = function(){
        PhysicsSystem.removeEntityFromSimulation(this);
        this._isInSimulation = false;
    }
    
    return PhysicsEntity;
});