define(['LightningPiece', 'Box2DStuff'], function(LightningPiece, Box2DStuff){
    
    var canvasWidth, canvasHeight, borderLightningPiece;
    
    var margin;
    
    var widthOfBlueThing;
    var heightOfBlueThing;
    
    var leftSide, topSide, rightSide, bottomSide;
    
    function initialize(p_canvasWidth, p_canvasHeight){
        canvasWidth = p_canvasWidth;
        canvasHeight = p_canvasHeight;
        
        margin = 0.025 * canvasWidth;
        widthOfBlueThing = canvasWidth - (margin * 2);
        heightOfBlueThing = 50;
        
        var borderPath = [ // X                      Y
                          [ margin,                margin, 
                            canvasWidth - margin,  margin, 
                            canvasWidth - margin,  canvasHeight - margin, 
                            margin,                canvasHeight - margin,      
                            margin,                margin ]       
        ];
        
        borderLightningPiece = new LightningPiece(canvasWidth, canvasHeight, borderPath, 20, 20, {closePath: true});
        
        var physicsBodyPositions = [ 
                                     [(margin + (widthOfBlueThing/2)) * Box2DStuff.scale, (margin + (heightOfBlueThing/2)) * Box2DStuff.scale], //top 
                                     [(canvasWidth - margin - (heightOfBlueThing/2)) * Box2DStuff.scale, (margin + ((canvasHeight - margin)/2)) * Box2DStuff.scale], //right
                                     [(margin + (widthOfBlueThing/2)) * Box2DStuff.scale, (canvasHeight - margin - (heightOfBlueThing/2)) * Box2DStuff.scale], //bottom
                                     [(margin + (heightOfBlueThing/2)) * Box2DStuff.scale, (margin + ((canvasHeight - margin)/2)) * Box2DStuff.scale] //left                
                                   ];
        
        
        var bodyDefs = new Box2DStuff.b2BodyDef();     
        var fixtureDefs = new Box2DStuff.b2FixtureDef();
        
        //some of the following lines are settings that will apply to all the sides and the following lines also create the top side 
        bodyDefs.type = Box2DStuff.b2Body.b2_staticBody;
        bodyDefs.position.Set(physicsBodyPositions[0][0], physicsBodyPositions[0][1]);
        fixtureDefs.density = 10;
        fixtureDefs.friction = 0;
        fixtureDefs.resitituation = 1;
        fixtureDefs.shape = new Box2DStuff.b2PolygonShape();
        fixtureDefs.shape.SetAsBox((widthOfBlueThing/2) * Box2DStuff.scale, (heightOfBlueThing/2) * Box2DStuff.scale);
        topSide = Box2DStuff.physicsWorld.CreateBody(bodyDefs);
        topSide.CreateFixture(fixtureDefs);
        topSide.SetUserData("top");
        
        //since the bottom side is the exact same as the top one except for the position, the bottom is set after the top instead of going clockwise (so instead of the right side in this case)
        bodyDefs.position.Set(physicsBodyPositions[2][0], physicsBodyPositions[2][1]);
        bottomSide = Box2DStuff.physicsWorld.CreateBody(bodyDefs);
        bottomSide.CreateFixture(fixtureDefs);
        bottomSide.SetUserData("bottom");
        
        //left side
        bodyDefs.position.Set(physicsBodyPositions[3][0], physicsBodyPositions[3][1]);
        fixtureDefs.shape = new Box2DStuff.b2PolygonShape();
        fixtureDefs.shape.SetAsBox((heightOfBlueThing/2) * Box2DStuff.scale, ((canvasHeight - (margin * 2))/2) * Box2DStuff.scale);
        leftSide = Box2DStuff.physicsWorld.CreateBody(bodyDefs);
        leftSide.CreateFixture(fixtureDefs);
        leftSide.SetUserData("left");
        
        
        //just like the bottom side was set right after the top, the right side if set after the left because it hsa much of the same settings except for the positioning as well as the user data
        bodyDefs.position.Set(physicsBodyPositions[1][0], physicsBodyPositions[1][1]);
        rightSide = Box2DStuff.physicsWorld.CreateBody(bodyDefs);
        rightSide.CreateFixture(fixtureDefs);
        rightSide.SetUserData("right");    
        
        console.log(bottomSide.GetPosition().x);
        
    }
    
    function draw(context, interpolation){
        borderLightningPiece.draw(context, interpolation, 0, 0);
    }
    
    function update(){
        borderLightningPiece.update();
       
    }
    
    function getLeftX(){
        return (margin + heightOfBlueThing);
    }
    function getTopY(){
        return (margin + heightOfBlueThing);
    }
    function getRightX(){
        return (canvasWidth - margin - heightOfBlueThing);
    }
    function getBottomY(){
        return (canvasHeight - margin - heightOfBlueThing);
    }
    
    function getLeftSidePhysicsBody(){
        return leftSide;
    }
    function getTopSidePhysicsBody(){
        return topSide;
    }
    function getRightSidePhysicsBody(){
        return rightSide;
    }
    function getBottomSidePhysicsBody(){
        return bottomSide;
    }
    
    
   
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        getLeftX: getLeftX,
        getTopY: getTopY,
        getRightX: getRightX,
        getBottomY: getBottomY,
        getLeftSidePhysicsBody: getLeftSidePhysicsBody,
        getTopSidePhysicsBody: getTopSidePhysicsBody,
        getRightSidePhysicsBody: getRightSidePhysicsBody,
        getBottomSidePhysicsBody: getBottomSidePhysicsBody,
    }
});