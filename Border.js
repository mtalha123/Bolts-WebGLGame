define(['LightningPiece', 'PhysicsSystem', 'EventSystem', 'ShaderProcessor', 'generateLightningCoordinates', 'Custom Utility/coordsToRGB', 'Custom Utility/getNoiseTexture', 'Custom Utility/convertToShaderCoordinates.js'], function(LightningPiece, PhysicsSystem, EventSystem, ShaderProcessor, generateLightningCoordinates, coordsToRGB, getNoiseTexture, convertToShaderCoordinates){
    
    var canvasWidth, canvasHeight, borderLightningPiece;    
    var margin;    
    var widthOfBlueThing;
    var heightOfBlueThing;
    var gapForScore;
    var score = 0;
    var scoreX, scoreY;
    
    var leftPhysicsBody = PhysicsSystem.requestPhysicsEntity("static");
    var topPhysicsBody = PhysicsSystem.requestPhysicsEntity("static");
    var rightPhysicsBody = PhysicsSystem.requestPhysicsEntity("static");
    var bottomPhysicsBody = PhysicsSystem.requestPhysicsEntity("static");
    
    var borderPath;
    var handler;
    var fontImage, scoreHandler;
    
    fontImage = new Image();
    fontImage.src = "Assets/arial.png";
    
    function initialize(gl, p_canvasWidth, p_canvasHeight){
        canvasWidth = p_canvasWidth;
        canvasHeight = p_canvasHeight;
        
        margin = 0.025 * canvasWidth;
        widthOfBlueThing = canvasWidth - (margin * 2);
        heightOfBlueThing = 50;
        gapForScore = 0.10 * canvasWidth;
        scoreX = margin + (widthOfBlueThing/2);
        scoreY = margin + 0.08 * canvasHeight;
        
        borderPath = [ //               X                                                   Y
                            margin + (widthOfBlueThing/2) - (gapForScore/2),                 margin,
                            margin,                                                          margin, 
                            margin,                                                          canvasHeight - margin,       
                            canvasWidth - margin,                                            canvasHeight - margin, 
                            canvasWidth - margin,                                            margin,
                            (canvasWidth - margin - (widthOfBlueThing/2)) + (gapForScore/2), margin           
        ];
        
        convertToShaderCoordinates(borderPath, canvasHeight);
        
        var borderCoords = coordsToRGB(borderPath, canvasWidth, canvasHeight);        
        
        handler = ShaderProcessor.requestLightningEffect();
        handler.setResolution(canvasWidth, canvasHeight);
        handler.setToBorderPath(canvasWidth, canvasHeight);
        var noiseTexture = getNoiseTexture(1024, 1024);
        handler.setNoiseTexture(noiseTexture, gl, 1024, 1024);
        handler.setLightningCoords(borderCoords, gl, 8);
        handler.shouldDraw(true);
        
        var physicsBodyPositions = [ 
                                     [margin + (widthOfBlueThing/2), margin + (heightOfBlueThing/2)], //top 
                                     [canvasWidth - margin - (heightOfBlueThing/2), (margin + (canvasHeight - margin) / 2)], //right
                                     [margin + (widthOfBlueThing/2), canvasHeight - margin - (heightOfBlueThing/2)], //bottom
                                     [margin + (heightOfBlueThing/2), (margin + (canvasHeight - margin) / 2)] //left                
                                   ];
        
        
        leftPhysicsBody.setX(physicsBodyPositions[3][0]);
        leftPhysicsBody.setY(physicsBodyPositions[3][1]);
        leftPhysicsBody.createRectangle(heightOfBlueThing, canvasHeight - (margin * 2), 10, 0, 1);
        PhysicsSystem.addToSimulation(leftPhysicsBody);
        
        rightPhysicsBody.setX(physicsBodyPositions[1][0]);
        rightPhysicsBody.setY(physicsBodyPositions[1][1]);
        rightPhysicsBody.createRectangle(heightOfBlueThing, canvasHeight - (margin * 2), 10, 0, 1);
        PhysicsSystem.addToSimulation(rightPhysicsBody);
        
        topPhysicsBody.setX(physicsBodyPositions[0][0]);
        topPhysicsBody.setY(physicsBodyPositions[0][1]);
        topPhysicsBody.createRectangle(widthOfBlueThing, heightOfBlueThing, 10, 0, 1);
        PhysicsSystem.addToSimulation(topPhysicsBody);
        
        bottomPhysicsBody.setX(physicsBodyPositions[2][0]);
        bottomPhysicsBody.setY(physicsBodyPositions[2][1]);
        bottomPhysicsBody.createRectangle(widthOfBlueThing, heightOfBlueThing, 10, 0, 1);
        PhysicsSystem.addToSimulation(bottomPhysicsBody);
        
        EventSystem.register(recieveEvent, "score_achieved");
        
        scoreHandler = ShaderProcessor.requestTextEffect();
        scoreHandler.canvasWidth = canvasWidth;
        scoreHandler.canvasHeight = canvasHeight;
        scoreHandler.setText("0", canvasWidth, canvasHeight);
        scoreHandler.setFontTexture(fontImage, gl, 512, 512);
        scoreHandler.shouldDraw(true);
    }
    
    function draw(interpolation){
//        borderLightningPiece.draw(context, interpolation, 0, 0);
//        
//        //drawBorderPlain(context);
//        
//        context.save();
//        
//        context.fillStyle = "yellow";
//        context.font = "50px Arial";
//        context.shadowBlur = 10;
//        context.shadowColor = "white";
//        for(var i = 0; i < 4; i ++){
//            context.fillText("" + score, scoreX - (context.measureText(score).width/2), scoreY);
//        }
//        
//        context.restore();
        
        scoreHandler.setText(score.toString(), canvasWidth, canvasHeight);
        //FIX: SHOULD BE "scoreHandler.width / 2"
        scoreHandler.setX(scoreX - (scoreHandler.width / 3.5));
        scoreHandler.setY(canvasHeight - scoreY);
        
    }
    
    function update(){
        //borderLightningPiece.update();
        
        var value = handler._uniforms.iGlobalTime.value[0];
        value++;
        if(value > 1023){
            value = 0;
        }
        handler._uniforms.iGlobalTime.value = [value];
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
        return leftPhysicsBody;
    }
    function getTopSidePhysicsBody(){
        return topPhysicsBody;
    }
    function getRightSidePhysicsBody(){
        return rightPhysicsBody;
    }
    function getBottomSidePhysicsBody(){
        return bottomPhysicsBody;
    }
    
    //THIS IS ONLY FOR TESTING TO SEE WHERE THE BORDER IS
    function drawBorderPlain(context){
        context.save();
        
        context.fillStyle = "rgb(0, 0, 200)";
        context.fillRect(getLeftX(), getTopY(), widthOfBlueThing, heightOfBlueThing);
        context.fillRect(getRightX(), getTopY(), heightOfBlueThing, widthOfBlueThing);
        context.fillRect(getLeftX(), getBottomY(), widthOfBlueThing, heightOfBlueThing);
        context.fillRect(getLeftX(), getTopY(), heightOfBlueThing, widthOfBlueThing);
        
        context.restore();
    }
    
    function recieveEvent(eventInfo){
        score += eventInfo.eventData;
    }
    
    //TESTING
    function getBorderPath(){
        return borderPath;
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
        getBorderPath: getBorderPath
    }
});