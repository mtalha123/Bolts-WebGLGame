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
            this._handler.setPosition(this._position.getX(), this._position.getY());
            return false;
        }else{
            this._position = this._destPosition;
            this._handler.setPosition(this._position.getX(), this._position.getY());
        }
        
        return true;
    }
    
    SimpleMovingBody.prototype.setPosition = function(position){
        this._position = position;
        this._handler.setPosition(position.getX(), position.getY());
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
    var context;
    var Cursor;
    var InputEventsManager;
    var isDestroying = false;
    var isActivating = true;
    var score;
    var radiusOfIndicators = 100;
    
    function initialize(p_PlayingState, p_EffectsManager, appMetaData, gl, p_context, p_Cursor, p_InputEventsManager, callback){
        EffectsManager = p_EffectsManager;
        PlayingState = p_PlayingState;
        
        var cWidth = appMetaData.getCanvasWidth(), cHeight = appMetaData.getCanvasHeight(); 
        
        restartButtonHandler = EffectsManager.requestBubblyOrbEffect(false, gl, 70, 0, 0, {radius: [radiusOfIndicators], particlesBool: [0.0]});
        restartButtonBody = new SimpleMovingBody( restartButtonHandler, cWidth, cHeight, new Vector(cWidth / 2, cHeight + (cHeight / 3.3)), new Vector(cWidth / 2, (cHeight / 3.3)) );
        
        bestScoreHandler = EffectsManager.requestTriangularTargetEffect(false, gl, 70, 0, 0, {radius: [radiusOfIndicators], lgBool: [0.0], autoRotationBool: [1.0]});
        bestScoreBody = new SimpleMovingBody( bestScoreHandler, cWidth, cHeight, new Vector(cWidth / 3, cHeight + (cHeight / 1.5)), new Vector(cWidth / 3, (cHeight / 1.5)) );
        
        scoreHandler = EffectsManager.requestBasicTargetEffect(false, gl, 70, 0, 0, {radius: [radiusOfIndicators], numBolts: [0.0]});
        scoreBody = new SimpleMovingBody( scoreHandler, cWidth, cHeight, new Vector(cWidth / 1.3, cHeight + (cHeight / 2)), new Vector(cWidth / 1.3, (cHeight / 2)) );
        
        darkerScreenHandler = EffectsManager.requestFullScreenColorHandler(false, 60);
        callbackToSwitchState = callback;
        hitRegions = new CircularHitRegions(cWidth / 2, cHeight / 3.3);
        hitRegions.addRegion(cWidth / 2, cHeight / 3.3, radiusOfIndicators);
        
        context = p_context;
        Cursor = p_Cursor;
        InputEventsManager = p_InputEventsManager;
    }
    
    function draw(gl, interpolation){
        restartButtonHandler.update();
        if(restartButtonBody.update()){
            isActivating = false;
        };

        bestScoreHandler.update();
        bestScoreBody.update();
        scoreHandler.update();
        scoreBody.update();
        darkerScreenHandler.update();
        Cursor.draw();
        
        gl.enable(gl.BLEND);
        
        doGLDrawingFromHandlers(gl, EffectsManager);    
        
        if(!isDestroying){
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            context.fillStyle = "yellow";
            context.font = '40px Arial';
            context.textAlign = "center";
            context.textBaseline = "middle"; 
            context.shadowBlur = 2;
            context.shadowColor = "white";
            context.fillText("Restart", restartButtonBody.getPosition().getX(), canvas.height - (restartButtonBody.getPosition().getY()));
            context.fillText("Best:", bestScoreBody.getPosition().getX(), (canvas.height - (bestScoreBody.getPosition().getY())) - (radiusOfIndicators / 3) );
            context.fillText("--", bestScoreBody.getPosition().getX(), (canvas.height - (bestScoreBody.getPosition().getY())) + (radiusOfIndicators / 3) );
            context.fillText("Score:", scoreBody.getPosition().getX(), (canvas.height - (scoreBody.getPosition().getY())) - (radiusOfIndicators / 3) );
            context.fillText(score.toString(), scoreBody.getPosition().getX(), (canvas.height - (scoreBody.getPosition().getY())) + (radiusOfIndicators / 3) );
        }
    }
    
    function update(){
        if(!isDestroying && !isActivating){
            var inputObj = InputEventsManager.getCurrentInputObj();

            if(inputObj.mouseState.type === "mouse_down" || inputObj.mouseState.type === "mouse_held_down"){
                if(hitRegions.isInAnyRegion(inputObj.mouseState.x, inputObj.mouseState.y)){
                    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                    isDestroying = true;
                    darkerScreenHandler.shouldDraw(false);
                    restartButtonHandler.doDestroyEffect(context.canvas.width / 2, context.canvas.height / 3.3, function(){
                        EventSystem.publishEventImmediately("game_restart", {});
                        callbackToSwitchState(PlayingState);
                    });                
                    bestScoreHandler.doDestroyEffect(context.canvas.width / 3, context.canvas.height / 1.5, function(){});                
                    scoreHandler.doDestroyEffect(context.canvas.width / 1.3, context.canvas.height / 2, function(){});
                }
            }
        }
    }
    
    function activate(p_score){
        restartButtonHandler.shouldDraw(true);
        bestScoreHandler.shouldDraw(true);
        scoreHandler.shouldDraw(true);
        darkerScreenHandler.startEffect();
        darkerScreenHandler._shouldDraw = true;
        isDestroying = false;
        isActivating = true;
        score = p_score;
        
        restartButtonBody.setPosition(new Vector(context.canvas.width / 2, context.canvas.height + (context.canvas.height / 3.3)));
        bestScoreBody.setPosition(new Vector(context.canvas.width / 3, context.canvas.height + (context.canvas.height / 1.5)));
        scoreBody.setPosition(new Vector(context.canvas.width / 1.3, context.canvas.height + (context.canvas.height / 2)));
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        activate: activate  
    };
});