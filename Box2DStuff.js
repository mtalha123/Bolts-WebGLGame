define(['Third Party/Box2D'], function(Box2D){
    
    var physicsWorld = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 0), true);
    
    return { 
            b2Vec2: Box2D.Common.Math.b2Vec2,
            b2BodyDef: Box2D.Dynamics.b2BodyDef,
            b2Body: Box2D.Dynamics.b2Body,
            b2FixtureDef: Box2D.Dynamics.b2FixtureDef,
            b2World: Box2D.Dynamics.b2World,
            b2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
            b2CircleShape: Box2D.Collision.Shapes.b2CircleShape,
            b2DebugDraw: Box2D.Dynamics.b2DebugDraw,
            b2ContactListener: Box2D.Dynamics.b2ContactListener,
        
            scale: 0.01,
            physicsWorld: physicsWorld
        }
});