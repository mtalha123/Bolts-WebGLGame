define(['Custom Utility/CircularHitRegions', 'doGLDrawingFromHandlers', 'Custom Utility/Vector', 'EventSystem'], function(CircularHitRegions, doGLDrawingFromHandlers, Vector, EventSystem){
    
    function SimpleMovingBody(handler, canvasWidth, canvasHeight, position, destPosition){
        this._velocity = new Vector(0, -(canvasHeight * 0.02));
        this._position = position;
        this._destPosition = destPosition;
        this._handler = handler;
    }
    
    SimpleMovingBody.prototype.update = function(){
        if(this._position.getY() > this._destPosition.getY()){
            this._position = this._position.addTo(this._velocity);
            this._handler.setPosition(this._position);
            return false;
        }else{
            this._position = this._destPosition;
            this._handler.setPosition(this._position);
        }
        
        return true;
    }
    
    SimpleMovingBody.prototype.setPosition = function(position){
        this._position = position;
        this._handler.setPosition(position);
    }
    
    SimpleMovingBody.prototype.getPosition = function(){
        return this._position;
    }
    
    var PlayingState;
    var restartButtonHandler, restartButtonBody;
    var scoreHandler, scoreBody;
    var bestScoreHandler, bestScoreBody;
    var darkerScreenHandler;
    var callbackToSwitchState;
    var hitRegions;
    var EffectsManager;
    var canvasWidth;
    var canvasHeight;
    var Cursor;
    var InputEventsManager;
    var isDestroying = false;
    var isActivating = true;
    var score;
    var radiusOfIndicators = 100;
    var lightningStrikeHandler;
    var lightningStrikeSoundEffect;
    var Border;
    var textHandler;
    
    function initialize(p_PlayingState, p_EffectsManager, AudioManager, appMetaData, gl, p_Cursor, p_InputEventsManager, p_Border, TextManager, callback){
        EffectsManager = p_EffectsManager;
        PlayingState = p_PlayingState;
        Border = p_Border;
        
        canvasWidth = appMetaData.getCanvasWidth()
        canvasHeight = appMetaData.getCanvasHeight(); 
        
        restartButtonHandler = EffectsManager.requestBubblyOrbEffect(false, gl, 370, new Vector(0, 0), {radius: [radiusOfIndicators], particlesBool: [0.0]});
        restartButtonBody = new SimpleMovingBody( restartButtonHandler, canvasWidth, canvasHeight, new Vector(canvasWidth / 2, canvasHeight + (canvasHeight / 3.3)), new Vector(canvasWidth / 2, canvasHeight / 3.3) );
        
        bestScoreHandler = EffectsManager.requestTriangularTargetEffect(false, gl, 370, new Vector(0, 0), {radius: [radiusOfIndicators], lgBool: [0.0], autoRotationBool: [1.0]});
        bestScoreBody = new SimpleMovingBody( bestScoreHandler, canvasWidth, canvasHeight, new Vector(canvasWidth / 3, canvasHeight + (canvasHeight / 1.5)), new Vector(canvasWidth / 3, (canvasHeight / 1.5)) );
        
        scoreHandler = EffectsManager.requestBasicTargetEffect(false, gl, 370, new Vector(0, 0), {radius: [radiusOfIndicators], numBolts: [0.0]});
        scoreBody = new SimpleMovingBody( scoreHandler, canvasWidth, canvasHeight, new Vector(canvasWidth / 1.3, canvasHeight + (canvasHeight / 2)), new Vector(canvasWidth / 1.3, (canvasHeight / 2)) );
        
        lightningStrikeHandler = EffectsManager.requestLightningStrikeHandler(false, gl, 100, new Vector(canvasWidth / 2, canvasHeight / 3.3), Border.getScorePosition(), {lineWidth: [10], glowFactor: [20]});
        lightningStrikeHandler.setDuration(2000);
        lightningStrikeSoundEffect = AudioManager.getAudioHandler("lightning_strike_sound_effect");
        
        darkerScreenHandler = EffectsManager.requestFullScreenColorHandler(false, 360, gl);
        callbackToSwitchState = callback;
        hitRegions = new CircularHitRegions(new Vector(canvasWidth / 2, canvasHeight / 3.3));
        hitRegions.addRegion(new Vector(canvasWidth / 2, canvasHeight / 3.3), radiusOfIndicators);
        
        textHandler = TextManager.requestTextHandler("Comic Sans MS", "yellow", appMetaData.getCanvasHeight() * 0.04, new Vector(100, 100), "", false);
        
        Cursor = p_Cursor;
        InputEventsManager = p_InputEventsManager;
    }
    
    function draw(gl, interpolation){
        restartButtonHandler.update();
        if(restartButtonBody.update()){
            isActivating = false;
        }

        bestScoreHandler.update();
        bestScoreBody.update();
        scoreHandler.update();
        scoreBody.update();
        Cursor.draw();
        
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        doGLDrawingFromHandlers(gl, EffectsManager);    
        
        if(!isDestroying){
            textHandler.shouldDraw(true);
            
            textHandler.setText("Restart");
            textHandler.setPosition(restartButtonBody.getPosition());
            textHandler.draw();
            
            textHandler.setText("Best:");
            textHandler.setPosition(bestScoreBody.getPosition().addTo(new Vector(0, radiusOfIndicators / 3)));
            textHandler.draw();
            
            textHandler.setText("--");
            textHandler.setPosition(bestScoreBody.getPosition().subtract(new Vector(0, radiusOfIndicators / 3)));
            textHandler.draw();
            
            textHandler.setText("Score:");
            textHandler.setPosition(scoreBody.getPosition().addTo(new Vector(0, radiusOfIndicators / 3)));
            textHandler.draw();
            
            textHandler.setText(score.toString());
            textHandler.setPosition(scoreBody.getPosition().subtract(new Vector(0, radiusOfIndicators / 3)));
            textHandler.draw();
        }
    }
    
    function update(){
        if(!isDestroying && !isActivating){
            var inputObj = InputEventsManager.getCurrentInputObj();

            if(inputObj.mouseState.type === "left_mouse_down" || inputObj.mouseState.type === "left_mouse_held_down"){
                if(hitRegions.isInAnyRegion(new Vector(inputObj.mouseState.x, inputObj.mouseState.y))){
                    isDestroying = true;
                    darkerScreenHandler.shouldDraw(false);
                    restartButtonHandler.doDestroyEffect(new Vector(canvasWidth / 2, canvasHeight / 3.3), function(){});
                    bestScoreHandler.doDestroyEffect(new Vector(canvasWidth / 3, canvasHeight / 1.5), function(){});                
                    scoreHandler.doDestroyEffect(new Vector(canvasWidth / 1.3, canvasHeight / 2), function(){});
                    lightningStrikeHandler.doStrikeEffect();
                    lightningStrikeSoundEffect.play();
                    EventSystem.publishEventImmediately("game_restart", {});
                    callbackToSwitchState(PlayingState);
                }
            }
        }
    }
    
    function activate(p_score){
        restartButtonHandler.shouldDraw(true);
        bestScoreHandler.shouldDraw(true);
        scoreHandler.shouldDraw(true);
        darkerScreenHandler.doEffect();
        isDestroying = false;
        isActivating = true;
        score = p_score;
        
        restartButtonBody.setPosition(new Vector(canvasWidth / 2, canvasHeight + (canvasHeight / 3.3)));
        bestScoreBody.setPosition(new Vector(canvasWidth / 3, canvasHeight + (canvasHeight / 1.5)));
        scoreBody.setPosition(new Vector(canvasWidth / 1.3, canvasHeight + (canvasHeight / 2)));
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        activate: activate  
    };
});