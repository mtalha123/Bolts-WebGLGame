define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Handlers/BasicParticlesHandler', 'Custom Utility/Vector'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, BasicParticlesHandler, Vector){
    
    function LinkHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, x1, y1, x2, y2, opts, ShaderLibrary){        
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            startCoord: {
                type: "vec2",
                value: [500.0, 475.0]
            },
            endCoord: {
                type: "vec2",
                value: [960.0, 575.0]
            },
            glowFactor: {
                type: "float",
                value: [1.0] 
            },
            color1: {
                type: "vec3",
                value: [0.0, 0.3, 1.0]
            },
            color2: {
                type: "vec3",
                value: [1.0, 1.0, 0.3]
            },
            completion: {
                type: "float",
                value: [0.0]
            },
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.LINK); 
        
        EntityHandler.call(this, shouldDraw, gl, 0, 0, zOrder, canvasWidth, canvasHeight, ShaderLibrary, opts);   
        
        this._padding = canvasHeight * 0.01;
        this.setCoords(x1, y1, x2, y2);
    }
    
    //inherit from Handler
    LinkHandler.prototype = Object.create(EntityHandler.prototype);
    LinkHandler.prototype.constructor = LinkHandler; 
    
    LinkHandler.prototype.update = function(){
        this._particlesHandler.update();
    }
    
    LinkHandler.prototype.setCoords = function(newX1, newY1, newX2, newY2){
        this._uniforms.startCoord.value = [newX1, newY1];
        this._uniforms.endCoord.value = [newX2, newY2];
        this._generateVerticesFromCurrentState();
    }
    
    LinkHandler.prototype.setCompletion = function(completion){
        this._uniforms.completion.value[0] = completion;
    }

    LinkHandler.prototype._generateVerticesFromCurrentState = function(){
        var startCoord = new Vector(this._uniforms.startCoord.value[0], this._uniforms.startCoord.value[1]);
        var endCoord = new Vector(this._uniforms.endCoord.value[0], this._uniforms.endCoord.value[1]);
        
        var dirVec = (endCoord.subtractFrom(startCoord)).getNormalized().multiplyWithScalar(this._padding);
        var negDirVec = dirVec.multiplyWithScalar(-1);
        var perp1 = new Vector(-dirVec.getY(), dirVec.getX());
        var perp2 = new Vector(dirVec.getY(), -dirVec.getX());
        
        var firstVertex = (startCoord.addTo(negDirVec)).addTo(perp1);
        var secondVertex = (startCoord.addTo(negDirVec)).addTo(perp2);
        var thirdVertex = (endCoord.addTo(dirVec)).addTo(perp1);
        var fourthVertex = (endCoord.addTo(dirVec)).addTo(perp2);

        var vertices = [firstVertex.getX(), firstVertex.getY(), secondVertex.getX(), secondVertex.getY(), thirdVertex.getX(), thirdVertex.getY(), thirdVertex.getX(), thirdVertex.getY(), secondVertex.getX(), secondVertex.getY(), fourthVertex.getX(), fourthVertex.getY()]; 
        
        //normalize
        for(var i = 0; i < vertices.length-1; i+=2){
            vertices[i] /= this._canvasWidth; 
            vertices[i+1] /= this._canvasHeight; 
        }
        
        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords(vertices);
    }
    
    return LinkHandler;
});