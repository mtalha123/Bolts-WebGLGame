define([''], function(){
    function doGLDrawingFromHandlers(gl, EffectsManager){
        var handlers = EffectsManager.getHandlers();
        var numVerticesDone = 0;
        for(var i = 0; i < handlers.length; i++){
            if(handlers[i].additiveBlending){
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            }else{
                //normal blending
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }
            gl.useProgram(handlers[i]._shaderProgram);
            EffectsManager.setUpAttributesAndUniforms(gl, handlers[i]);
            gl.drawArrays(gl.TRIANGLES, 0, handlers[i].getNumVertices());
            numVerticesDone += handlers[i].getNumVertices();
        }
    }
    
    return doGLDrawingFromHandlers;
});
