define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Handlers/BasicParticlesHandler'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, BasicParticlesHandler){
    
    function getNormalized(vector){
        var magnitude = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
        return [vector[0] / magnitude, vector[1] / magnitude];
    }
    
    
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
        
        EntityHandler.call(this, shouldDraw, gl, 0, 0, zOrder, canvasWidth, canvasHeight, ShaderLibrary, opts);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.LINK); 
        
        this._padding = canvasHeight * 0.02;
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
        var startCoord = this._uniforms.startCoord.value;
        var endCoord = this._uniforms.endCoord.value;
        var padding = this._padding;
        
        var dirVec = getNormalized([endCoord[0] - startCoord[0], endCoord[1] - startCoord[1]]);
        dirVec = [dirVec[0] * padding, dirVec[1] * padding];
        var negDirVec = [dirVec[0] * -1, dirVec[1] * -1];
        var perp1 = [-dirVec[1], dirVec[0]];
        var perp2 = [dirVec[1], -dirVec[0]];
        
        var firstVertex = [startCoord[0] + negDirVec[0] + perp1[0], startCoord[1] + negDirVec[1] + perp1[1]];
        var secondVertex = [startCoord[0] + negDirVec[0] + perp2[0], startCoord[1] + negDirVec[1] + perp2[1]];
        var thirdVertex = [endCoord[0] + dirVec[0] + perp1[0], endCoord[1] + dirVec[1] + perp1[1]];
        var fourthVertex = [endCoord[0] + dirVec[0] + perp2[0], endCoord[1] + dirVec[1] + perp2[1]];
        
        var vertices = [firstVertex[0], firstVertex[1], secondVertex[0], secondVertex[1], thirdVertex[0], thirdVertex[1], thirdVertex[0], thirdVertex[1], secondVertex[0], secondVertex[1], fourthVertex[0], fourthVertex[1]];

        //normalize
        for(var i = 0; i < vertices.length-1; i+=2){
            vertices[i] /= this._canvasWidth; 
            vertices[i+1] /= this._canvasHeight; 
        }
        
        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords(vertices);
    }
    
    return LinkHandler;
});