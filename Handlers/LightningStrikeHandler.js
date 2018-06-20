define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Custom Utility/coordsToRGB', 'Custom Utility/Vector', 'timingCallbacks', 'Handlers/BasicParticlesHandler'], function(Handler, getVerticesUnNormalized, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, coordsToRGB, Vector, timingCallbacks, BasicParticlesHandler){
    
    function LightningStrikeHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, lightningStart, lightningEnd, opts, ShaderLibrary, noiseTextureData){
        this._uniforms = { 
            iResolution: { 
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            iGlobalTime: {
                type: "float",
                value: [1]
            },
            lightningStart: {
                type: "vec2",
                value: [100, 100]
            },
            lightningEnd: {
                type: "vec2",
                value: [300, 300]
            },
            fluctuation: {
                type: "float",
                value: [40.0]
            },
            jaggedFactor: {
                type: "float",
                value: [2.0]
            },
            glowFactor: {
                type: "float",
                value: [5]
            },
            boltColor: {
                type: "vec3",
                value: [1.0, 1.0, 0.0]
            },
            lineWidth: {
                type: "float",
                value: [1.0]
            },
            completion: {       // 1.0 = fully show, 0.0 = fully hide
                type: "float",
                value: [0.0]
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.LIGHTNING_STRIKE);        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);
        this._particlesHandler = new BasicParticlesHandler(false, 30, canvasWidth, canvasHeight, gl, zOrder, lightningEnd, {FXType: [1], maxLifetime: [300], particlesColor: [1.0, 1.0, 0.7], radiusOfExplosion: [canvasHeight * 0.08]}, ShaderLibrary);
        this._handlers.push(this._particlesHandler);
        this.setLightningStrikeCoords(lightningStart, lightningEnd);
        this._duration = 1000;
    }
    
    //inherit from Handler
    LightningStrikeHandler.prototype = Object.create(Handler.prototype);
    LightningStrikeHandler.prototype.constructor = LightningStrikeHandler; 

    LightningStrikeHandler.prototype.setLightningStrikeCoords = function(start, end){
        this._uniforms.lightningStart.value = [start.getX(), start.getY()];
        this._uniforms.lightningEnd.value = [end.getX(), end.getY()];        
        
        this._uniformsDefault.lightningStart.value = [start.getX(), start.getY()];
        this._uniformsDefault.lightningEnd.value = [end.getX(), end.getY()];
        
        this._particlesHandler.setPosition(end);
        
        this._generateVerticesFromCoords();
    }
    
    LightningStrikeHandler.prototype.setLightningStrikeEndCoord = function(end){
        this.setLightningStrikeCoords(new Vector(this._uniforms.lightningStart.value[0], this._uniforms.lightningStart.value[1]), end);
    }
    
    LightningStrikeHandler.prototype.doStrikeEffect = function(optCallback){
        // in case a strike happened soon before
        timingCallbacks.removeTimingEvent(this, true);
        
        this._shouldDraw = true;
        var particlesEffectDone = false;
        this._uniforms.iGlobalTime.value[0] = Math.random() * 1000;
        
        timingCallbacks.addTimingEvent(this, this._duration, function(time){            
            if(time <= 100){
                this._uniforms.completion.value[0] = time / 70;
            }else{
                this._uniforms.completion.value[0] = 1.0;
                this._uniforms.glowFactor.value[0] *= (1.0 - (time / this._duration));
                this._uniforms.lineWidth.value[0] *= (1.0 - (time / this._duration));    
            }
            
            if(particlesEffectDone === false && time >= 70){
                this._particlesHandler.doEffect(function(){});
                particlesEffectDone = true;
            }
            
        }, function(){
            this._shouldDraw = false;
            this._uniforms.completion.value[0] = 0.0;
            this.resetProperties();
            if(optCallback){
                optCallback();
            }
        });
    }
    
    LightningStrikeHandler.prototype.setDuration = function(duration){
        this._duration = duration;
    }
    
    LightningStrikeHandler.prototype._generateVerticesFromCoords = function(){
        var startCoord = new Vector(this._uniforms.lightningStart.value[0], this._uniforms.lightningStart.value[1]);
        var endCoord = new Vector(this._uniforms.lightningEnd.value[0], this._uniforms.lightningEnd.value[1]);

        var padding = (0.06 * this._canvasHeight) + this._uniforms.lineWidth.value[0] + this._uniforms.glowFactor.value[0] + this._uniforms.fluctuation.value[0];

        var dirVec = (endCoord.subtract(startCoord)).getNormalized().multiplyWithScalar(padding);
        var negDirVec = dirVec.multiplyWithScalar(-1);
        var perp1 = new Vector(-dirVec.getY(), dirVec.getX());
        var perp2 = new Vector(dirVec.getY(), -dirVec.getX());

        var firstVertex = (startCoord.addTo(negDirVec)).addTo(perp1);
        var secondVertex = (startCoord.addTo(negDirVec)).addTo(perp2);
        var thirdVertex = (endCoord.addTo(dirVec)).addTo(perp1);
        var fourthVertex = (endCoord.addTo(dirVec)).addTo(perp2);

        var vertices = [firstVertex.getX(), firstVertex.getY(), secondVertex.getX(), secondVertex.getY(), thirdVertex.getX(), thirdVertex.getY(), thirdVertex.getX(), thirdVertex.getY(), secondVertex.getX(), secondVertex.getY(), fourthVertex.getX(), fourthVertex.getY()];

        //normalize
        for(var a = 0; a < vertices.length-1; a+=2){
            vertices[a] /= this._canvasWidth; 
            vertices[a+1] /= this._canvasHeight; 
        }
        
        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords(vertices);
    }
    
    return LightningStrikeHandler;
});