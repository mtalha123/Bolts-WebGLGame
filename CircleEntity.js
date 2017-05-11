define(['PhysicsEntity', 'Box2DStuff'], function(PhysicsEntity, Box2DStuff){
    function CircleEntity(bodyType, x, y, canvasHeight, radius, density, friction, restitution){
        PhysicsEntity.call(this, bodyType, x, y, canvasHeight, density, friction, restitution);
        
        this._fixtureDef.shape = new Box2DStuff.b2CircleShape(radius * Box2DStuff.scale); 
        this._radius = radius;
        this.setPosition(x, y);
    }
    
    //inherit from PhysicsEntity
    CircleEntity.prototype = Object.create(PhysicsEntity.prototype);
    CircleEntity.prototype.constructor = CircleEntity; 
    
    CircleEntity.prototype.setPosition = function(newX, newY){
        this._x = newX;
        this._y = newY;
        
        if(this._isInSimulation){
            this._body.SetPosition(new Box2DStuff.b2Vec2( (newX + this._radius)  * Box2DStuff.scale, (this._canvasHeight - (newY - this._radius)) * Box2DStuff.scale ) );
        }else{
            this._bodyDef.position.Set( (newX + this._radius) * Box2DStuff.scale, (this._canvasHeight - (newY - this._radius)) * Box2DStuff.scale);
        }
    }
    
    CircleEntity.prototype.update = function(){
        if(this._isInSimulation){
            this._x = (this._body.GetPosition().x / Box2DStuff.scale) - this._radius;
            this._y = (this._canvasHeight - (this._body.GetPosition().y / Box2DStuff.scale)) + this._radius;
        }
    }
    
    return CircleEntity;
});