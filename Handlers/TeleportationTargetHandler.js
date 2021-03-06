define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Custom Utility/Vector', 'Custom Utility/Timer'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, Vector, Timer){
    
    function TeleportationTargetHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, noiseTextureData){
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            iGlobalTime: {
                type: "float",
                value: [1.0]
            },
            center: {
                type: "vec2",
                value: [960.0, 475.0]
            },
            radius: {
                type: "float",
                value: [150.0] 
            },
            dirVec: {
                type: "vec2",
                value: [0, 0]
            },
            portalLocation: {
                type: "vec2",
                value: [0, 0]
            },
            portalActivated: {
                type: "float",
                value: [0.0]
            },
            appearing: {
                type: "float",
                value: [0.0]
            },
            capturedBool: {
                type: "float",
                value: [0.0]
            },
            numBolts: {
                type: "float",
                value: [3]
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.TELEPORTATION_TARGET);
        this._timer = new Timer();
        this._timeForPortalToDisappear = 500;
        this._radiusMultiplierForGenVertices = 2.5;
        EntityHandler.call(this, shouldDraw, gl,  zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts);   
        
        this.setPosition(position);
    }
    
    //inherit from EntityHandler
    TeleportationTargetHandler.prototype = Object.create(EntityHandler.prototype);
    TeleportationTargetHandler.prototype.constructor = TeleportationTargetHandler; 
    
    TeleportationTargetHandler.prototype.disappear = function(dirVec){
        this._uniforms.appearing.value[0] = 0.0;        
        this._timer.start();
        this._makePortalAppear(dirVec);
    }
    
    TeleportationTargetHandler.prototype.appear = function(dirVec){
        this._timer.start();
        this._shouldDraw = true;
        this._uniforms.appearing.value[0] = 1.0;
        this._makePortalAppear(dirVec);
    }
    
    TeleportationTargetHandler.prototype._makePortalAppear = function(dirVec){
        this._uniforms.portalActivated.value = [1.0];
        this._uniforms.dirVec.value = [dirVec.getX(), dirVec.getY()];
        var distFromCenterToPortal = this._uniforms.radius.value[0] * 2;
        var portalLocation = (new Vector(this._uniforms.center.value[0], this._uniforms.center.value[1])).addTo(dirVec.multiplyWithScalar(distFromCenterToPortal));
        this._uniforms.portalLocation.value = [portalLocation.getX(), portalLocation.getY()];
    }
    
    TeleportationTargetHandler.prototype.update = function(){
        EntityHandler.prototype.update.call(this);
        if(this._timer.getTime() > this._timeForPortalToDisappear){
            if(this._uniforms.appearing.value[0]){
                this._uniforms.portalActivated.value = [0.0];
            }else{ 
                this._shouldDraw = false;
            }
            this._timer.reset();
        }
    }
    
    TeleportationTargetHandler.prototype.deactivatePortal = function(){
        this._uniforms.portalActivated.value = [0.0];
    }
    
    TeleportationTargetHandler.prototype.setCapturedToTrue = function(){
        this._uniforms.capturedBool.value = [1.0];
    }    
    
    TeleportationTargetHandler.prototype.setCapturedToFalse = function(){
        this._uniforms.capturedBool.value = [0.0];
    }
    
    TeleportationTargetHandler.prototype.setNumBolts = function(numBolts){
        this._uniforms.numBolts.value = [numBolts];
    }
    
    TeleportationTargetHandler.prototype.resetProperties = function(opts){
        EntityHandler.prototype.resetProperties.call(this, opts);
        this._timer.reset();
    }
    
    return TeleportationTargetHandler;
});