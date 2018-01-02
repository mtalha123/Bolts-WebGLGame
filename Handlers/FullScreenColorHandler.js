define(['Handlers/Handler', 'SynchronizedTimers', 'Custom Utility/getVerticesUnNormalized'], function(Handler, SynchronizedTimers, getVerticesUnNormalized){
    function FullScreenColorHandler(shouldDraw, zOrder, gl, canvasWidth, canvasHeight, ShaderLibrary){
        this._uniforms = {
            color: {
                type: "vec4",
                value: [0.0, 0.0, 0.0, 1.0]
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.FULL_SCREEN_COLOR); 
        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, {});   
        
        this._timer = SynchronizedTimers.getTimer();
        this._duration = 1000;
        
         //whole screen
        this._attributes.vertexPosition = getVerticesUnNormalized(-1, -1, 2, 2); 
    }
    
    //inherit from Handler
    FullScreenColorHandler.prototype = Object.create(Handler.prototype);
    FullScreenColorHandler.prototype.constructor = FullScreenColorHandler; 
    
    FullScreenColorHandler.prototype.update = function(){
        if(this._timer.getTime() <= this._duration){
            this._uniforms.color.value[3] = (this._timer.getTime() / this._duration) * 0.9;              
        }
    }
    
    FullScreenColorHandler.prototype.startEffect = function(){
        this._timer.reset();
        this._timer.start();   
    }
    
    return FullScreenColorHandler;
});