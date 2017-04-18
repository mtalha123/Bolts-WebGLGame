define(['Box2DStuff'], function(Box2DStuff){
    
    var allEntities = [];
    var id = 1000;
    var canvasWidth, canvasHeight;
    
    function initialize(p_canvasWidth, p_canvasHeight){
        canvasWidth = p_canvasWidth;
        canvasHeight = p_canvasHeight;
    }
    
    function addToSimulation(physicsEntity){
        for(var i = 0; i < allEntities.length; i++){
            if(physicsEntity._id === allEntities[i]._id){
                allEntities[i]._body = Box2DStuff.physicsWorld.CreateBody(allEntities[i]._bodyDef);
                allEntities[i]._body.CreateFixture(allEntities[i]._fixtureDef);
                allEntities[i]._isInSimulation = true;
                break;
            }
        }
    }
    
    function requestPhysicsEntity(bodyType){
        var physicsEntity = new PhysicsEntity(bodyType, id);
        allEntities.push(physicsEntity);
        id++;
        return physicsEntity;
    }
    
    function update(timestep, velocityIterations, positionIterations){
        Box2DStuff.physicsWorld.Step(timestep, velocityIterations, positionIterations);
        
        for(var i = 0; i < allEntities.length; i++){
            if(allEntities[i]._isInSimulation){
                allEntities[i]._update();   
            }
        }
    }
    
    function removeEntityFromSimulation(entity){
        for(var i = 0; i < allEntities.length; i++){
            if(allEntities[i]._id === entity._id){
                allEntities[i]._isInSimulation = false;
                Box2DStuff.physicsWorld.DestroyBody(allEntities[i]._body);
            }
        }
    }
    
    function PhysicsEntity(bodyType, id){
        this._id = id;
        this._x = 0;
        this._y = 0;        
        this._bodyDef = new Box2DStuff.b2BodyDef();
        this._bodyDef.position.Set(this._x * Box2DStuff.scale, this._y * Box2DStuff.scale);
        
        if(bodyType === "static"){
            this._bodyDef.type = Box2DStuff.b2Body.b2_staticBody;  
        }else if(bodyType === "dynamic"){
            this._bodyDef.type = Box2DStuff.b2Body.b2_dynamicBody;     
        } 
        //the following line will set all the targets to be "bullet bodies", meaning they will not overlap (the collision will be more accurate). **REDUCES PERFORMANCE***
        this._bodyDef.bullet = true;       
        this._bodyDef.fixedRotation = true;       
        this._isInSimulation = false; 
        this._body = undefined;
        this._fixtureDef = undefined;
        this._radius = 0;
    }
    
    PhysicsEntity.prototype.createCircle = function(radius, density, friction, restitution){
        this._fixtureDef = this._createFixtureDef(density, friction, restitution);
        this._fixtureDef.shape = new Box2DStuff.b2CircleShape(radius * Box2DStuff.scale); 
        this._radius = radius;
    }
    
    PhysicsEntity.prototype.createRectangle = function(width, height, density, friction, restitution){
        this._fixtureDef = this._createFixtureDef(density, friction, restitution);
        this._fixtureDef.shape = new Box2DStuff.b2PolygonShape();
        this._fixtureDef.shape.SetAsBox((width / 2) * Box2DStuff.scale, (height / 2) * Box2DStuff.scale);
    }
    
    PhysicsEntity.prototype.setX = function(newX){
        this._x = newX;
        
        if(this._isInSimulation){
            this._body.SetPosition(new Box2DStuff.b2Vec2( newX  * Box2DStuff.scale, this._y * Box2DStuff.scale ) );
        }else{
            this._bodyDef.position.Set(newX * Box2DStuff.scale, this._y * Box2DStuff.scale);
        }
    }
    
    PhysicsEntity.prototype.setY = function(newY){
        this._y = newY;
        
        if(this._isInSimulation){
            this._body.SetPosition(new Box2DStuff.b2Vec2( this._x * Box2DStuff.scale, newY * Box2DStuff.scale) );
        }else{
            this._bodyDef.position.Set(this._x * Box2DStuff.scale, newY * Box2DStuff.scale);
        }
    }
    
    PhysicsEntity.prototype.getX = function(){
        return this._x;
    }
    
    PhysicsEntity.prototype.getY = function(){
        return this._y;
    }
    
    PhysicsEntity.prototype.setLinearVelocity = function(x, y){
        this._velocityVector = new Box2DStuff.b2Vec2(x, y);
        
        if(this._isInSimulation){
            this._body.SetLinearVelocity(this._velocityVector);
        }else{
            this._bodyDef.linearVelocity = this._velocityVector;
        }
    }
    
    PhysicsEntity.prototype.getLinearVelocity = function(){
        if(this._isInSimulation){
            return this._body.GetLinearVelocity();
        }
    }
    
    PhysicsEntity.prototype._update = function(){
        this._x = ((this._body.GetPosition().x / Box2DStuff.scale));
        this._y = ((this._body.GetPosition().y / Box2DStuff.scale));
    }
    
    PhysicsEntity.prototype._createFixtureDef = function(density, friction, restitution){
        var fixtureDef = new Box2DStuff.b2FixtureDef();
        fixtureDef.density = density;
        fixtureDef.friction = friction;
        fixtureDef.restitution = restitution;
        return fixtureDef;
    }
    
    
    return {
        initialize: initialize,
        requestPhysicsEntity: requestPhysicsEntity,
        addToSimulation: addToSimulation,
        update: update,
        removeEntityFromSimulation: removeEntityFromSimulation
    };
    
    
});