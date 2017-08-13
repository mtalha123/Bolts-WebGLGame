define(['PhysicsSystem', 'EventSystem', 'Custom Utility/coordsToRGB', 'Custom Utility/getSimplexNoiseTexture', 'RectangleEntity'], function(PhysicsSystem, EventSystem, coordsToRGB, getSimplexNoiseTexture, RectangleEntity){
    
    var margin;    
    var borderLength;
    var borderWidth;
    var gapForScore;
    var score = 0;
    var scoreX, scoreY;
    
    var borderPath;
    var handler;
    var scoreHandler;
    var appMetaData;
    
    EventSystem.register(recieveEvent, "initialize");
    
    function initialize(gl, p_appMetaData, AssetManager, EffectsManager){     
        appMetaData = p_appMetaData;
        
        margin = 0.05 * appMetaData.getCanvasHeight();
        borderLength = appMetaData.getCanvasWidth() - (margin * 2);
        borderWidth = 0.05 * appMetaData.getCanvasHeight();
        gapForScore = 0.10 * appMetaData.getCanvasWidth();
        scoreX = margin + (borderLength/2);
        scoreY = margin + 0.08 * appMetaData.getCanvasHeight();
        
        borderPath = [ //               X                                                                           Y
                            margin + (borderLength/2) - (gapForScore/2),                                  appMetaData.getCanvasHeight() - margin,
                            margin,                                                                       appMetaData.getCanvasHeight() - margin, 
                            margin,                                                                       margin,       
                            appMetaData.getCanvasWidth() - margin,                                        margin, 
                            appMetaData.getCanvasWidth() - margin,                                        appMetaData.getCanvasHeight() - margin,
                            (appMetaData.getCanvasWidth() - margin - (borderLength/2)) + (gapForScore/2), appMetaData.getCanvasHeight() - margin           
        ];
        
        handler = EffectsManager.requestLightningEffect(true, gl, 3, {}, borderPath);
        
        EventSystem.register(recieveEvent, "score_achieved");
        
        scoreHandler = EffectsManager.requestTextEffect(true, gl, 4, {}, 100, 100, "0");
    }
    
    function draw(interpolation){        
        scoreHandler.setText(score.toString());
        //FIX: SHOULD BE "scoreHandler.width / 2"
        scoreHandler.setPosition(scoreX - (scoreHandler.getWidth() / 3.5), appMetaData.getCanvasHeight() - scoreY);
        handler.update();
        
    }
    
    function update(){        
    }
    
    
    function getLeftX(){
        return (margin + borderWidth);
    }
    function getTopY(){
        return appMetaData.getCanvasHeight() - (margin + borderWidth);
    }
    function getRightX(){
        return (appMetaData.getCanvasWidth() - margin - borderWidth);
    }
    function getBottomY(){
        return margin + borderWidth;
    }
    
    function recieveEvent(eventInfo){
        score += eventInfo.eventData;
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        getLeftX: getLeftX,
        getTopY: getTopY,
        getRightX: getRightX,
        getBottomY: getBottomY,
    }
});