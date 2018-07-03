define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'timingCallbacks'], function(Handler, getVerticesUnNormalized, timingCallbacks){
    function FullScreenColorHandler(shouldDraw, zOrder, gl, canvasWidth, canvasHeight, ShaderLibrary){
        this._uniforms = {
            color: {
                type: "vec4",
                value: [0.0, 0.0, 0.0, 1.0]
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.FULL_SCREEN_COLOR); 
        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, {});   
        
        this._gl = gl;
        
         //whole screen
        this._attributes.vertexPosition = getVerticesUnNormalized(-1, -1, 2, 2); 
    }
    
    //inherit from Handler
    FullScreenColorHandler.prototype = Object.create(Handler.prototype);
    FullScreenColorHandler.prototype.constructor = FullScreenColorHandler; 
    
    FullScreenColorHandler.prototype.doEffect = function(){
        var duration = 1000;
        this._shouldDraw = true;
        
        timingCallbacks.addTimingEvents(this, duration, 1, function(time){
            this._uniforms.color.value[3] = (time / duration) * 0.9;
        }, function(){});  
    }
    
    return FullScreenColorHandler;
});