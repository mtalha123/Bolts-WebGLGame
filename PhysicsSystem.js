define(['Box2DStuff'], function(Box2DStuff){
    
    var allEntities = [];
    
    function addToSimulation(physicsEntity){
        return Box2DStuff.physicsWorld.CreateBody(physicsEntity.getBodyDefinition());
    }
    
    function update(timestep, velocityIterations, positionIterations){
        Box2DStuff.physicsWorld.Step(timestep, velocityIterations, positionIterations);
    }
    
    function removeEntityFromSimulation(physicsEntity){
        Box2DStuff.physicsWorld.DestroyBody(physicsEntity.getBody());
    }    
    
    return {
        addToSimulation: addToSimulation,
        update: update,
        removeEntityFromSimulation: removeEntityFromSimulation
    };
});