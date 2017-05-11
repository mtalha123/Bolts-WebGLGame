define(['PhysicsEntity', 'Box2DStuff'], function(PhysicsEntity, Box2DStuff){
    function RectangleEntity(bodyType, canvasHeight, x, y, width, height, density, friction, restitution){
        PhysicsEntity.call(this, bodyType, x, y, canvasHeight, density, friction, restitution);
        
        this._width = width;
        this._height = height;
        
        this.setPosition(x, y);
        this._fixtureDef.shape = new Box2DStuff.b2PolygonShape();
        this._fixtureDef.shape.SetAsBox((width / 2) * Box2DStuff.scale, (height / 2) * Box2DStuff.scale);
    }
    
    //inherit from PhysicsEntity
    RectangleEntity.prototype = Object.create(PhysicsEntity.prototype);
    RectangleEntity.prototype.constructor = RectangleEntity; 
    
    RectangleEntity.prototype.setPosition = function(newX, newY){
        this._x = newX;
        this._y = newY;
        
        if(this._isInSimulation){
            this._body.SetPosition(new Box2DStuff.b2Vec2( (newX + (this._width / 2)) * Box2DStuff.scale, (this._canvasHeight - (newY + (this._height / 2))) * Box2DStuff.scale ));
        }else{
            this._bodyDef.position.Set( (newX + (this._width / 2)) * Box2DStuff.scale, (this._canvasHeight - (newY + (this._height / 2))) * Box2DStuff.scale );
        }
    }
    
    RectangleEntity.prototype.update = function(){
        if(this._isInSimulation){
            this._x = (this._body.GetPosition().x / Box2DStuff.scale) - (this._width / 2);
            this._y = (this._canvasHeight - (this._body.GetPosition().y / Box2DStuff.scale)) + (this._height / 2);
        }
    }
    
    return RectangleEntity;
});