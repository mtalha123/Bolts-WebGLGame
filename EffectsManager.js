define(['Custom Utility/getTextInfo', 'Custom Utility/map', 'Handlers/LightningHandler', 'Handlers/BasicTargetHandler', 'Handlers/TextHandler', 'Handlers/CursorHandler', 'Handlers/ComboHandler', 'Handlers/LightningOrbHandler', 'Handlers/LightningOrbStreakHandler', 'Handlers/BubblyOrbHandler', 'Handlers/TriangularTargetHandler', 'Handlers/FourPointTargetHandler', 'Handlers/SpikeEnemyHandler', 'Handlers/BasicParticlesHandler', 'Handlers/FullScreenColorHandler', 'Handlers/LifebarHandler', 'Custom Utility/Timer', 'Handlers/TentacleEnemyHandler', 'Handlers/OrbitEnemyHandler', 'Handlers/RingLightningHandler', 'Handlers/TeleportationTargetHandler', 'Handlers/LightningStrikeHandler', 'Handlers/GlowingRingHandler', 'Handlers/SpriteHandler', 'Handlers/RectangleHandler'], function(getTextInfo, map, LightningHandler, BasicTargetHandler, TextHandler, CursorHandler, ComboHandler, LightningOrbHandler, LightningOrbStreakHandler, BubblyOrbHandler, TriangularTargetHandler, FourPointTargetHandler, SpikeEnemyHandler, BasicParticlesHandler, FullScreenColorHandler, LifebarHandler, Timer, TentacleEnemyHandler, OrbitEnemyHandler, RingLightningHandler, TeleportationTargetHandler, LightningStrikeHandler, GlowingRingHandler, SpriteHandler, RectangleHandler){
    
    var allHandlers = [];
    var automaticUpdatesHandlerObjs = [];
    
    var ShaderLibrary;
    var fontTexture;
    var spiderWebTexture;
    var simplexNoiseTextureFaster, simplexNoiseTextureSlower;
    var appMetaData;

    
    
    function initialize(p_ShaderLibrary, p_appMetaData, AssetManager){
        ShaderLibrary = p_ShaderLibrary;
        appMetaData = p_appMetaData;
        
        fontTexture = AssetManager.getTextureAsset("arial");
        spiderWebTexture = AssetManager.getTextureAsset("spiderWeb");
        simplexNoiseTextureFaster = AssetManager.getTextureAsset("simplexNoiseFaster");
        simplexNoiseTextureSlower = AssetManager.getTextureAsset("simplexNoiseSlower");
    }    
    
    function addHandlers(handlers){
        
        function addHandler(handler){
            if(allHandlers.length === 0){
                allHandlers.push(handler);
                return;
            }
            
            for(var i = 0; i < allHandlers.length; i++){
                if(handler.getZOrder() <= allHandlers[i].getZOrder()){
                    allHandlers.splice(i, 0, handler);
                    return;
                }
            }
            allHandlers.push(handler);
        }
        
        
        if(handlers instanceof Array){
            for(var a = 0; a < handlers.length; a++){
                addHandler(handlers[a]);
            }
        }else{
            addHandler(handlers);
        }   
    }
    
    function requestLightningEffect(shouldDraw, gl, zOrder, opts, coords){
        var handler = new LightningHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, coords, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, width: 1024, height: 1024, sampler: 0}, 1);
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestBasicTargetEffect(shouldDraw, gl, zOrder, position, opts){
        var handler = new BasicTargetHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, width: 1024, height: 1024, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestTextEffect(shouldDraw, gl, zOrder, opts, position, text){
        var handler = new TextHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, ShaderLibrary, {fontTexture: fontTexture, width: 512, height: 512, sampler: 0}, position, text);
        
        addHandlers(handler);
        return handler;
    }

    function requestCursorEffect(shouldDraw, zOrder, opts, gl, position){
        var handler = new CursorHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, ShaderLibrary, position);
        
        addHandlers(handler);
        return handler;
    }
    
    function requestComboEffect(shouldDraw, gl, zOrder, position, opts, text){
        var handler = new ComboHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {fontTexture: fontTexture, width: 512, height: 512, sampler: 0}, {effectTexture: spiderWebTexture, width: 1024, height: 1024, sampler: 1}, text);
        
        addHandlers(handler);
        return handler;
    }
    
    function requestLightningOrbEffect(shouldDraw, gl, zOrder, position, opts){
        var handler = new LightningOrbHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }
    
    function requestEnemySpikeEffect(shouldDraw, gl, zOrder, position, opts){
        var handler = new SpikeEnemyHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestLightningOrbWithStreakEffect(shouldDraw, gl, zOrder, position, opts){
        var handler = new LightningOrbStreakHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestBubblyOrbEffect(shouldDraw, gl, zOrder, position, opts){
        var handler = new BubblyOrbHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestTriangularTargetEffect(shouldDraw, gl, zOrder, position, opts){
        var handler = new TriangularTargetHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestFourPointLightningEffect(shouldDraw, gl, zOrder, position, opts){
        var handler = new FourPointTargetHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, sampler: 0});

        addHandlers(handler.getAllHandlers());
        return handler;
    }
    
    function requestBasicParticleEffect(shouldDraw, gl, numParticles, zOrder, position, opts){
        var handler = new BasicParticlesHandler(shouldDraw, numParticles, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary);

        addHandlers(handler);
        return handler;
    }
    
    function requestFullScreenColorHandler(shouldDraw, zOrder, gl){
        var handler = new FullScreenColorHandler(shouldDraw, zOrder, gl, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), ShaderLibrary);

        addHandlers(handler);
        return handler;
    }
    
    function requestLifebarHandler(shouldDraw, gl, zOrder, startPos, endPos, opts){
        var handler = new LifebarHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, startPos, endPos, opts, ShaderLibrary);

        addHandlers(handler.getAllHandlers());
        return handler;
    }
    
    function requestTentacleEnemyHandler(shouldDraw, gl, zOrder, position, opts){
        var handler = new TentacleEnemyHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureSlower, sampler: 0});

        addHandlers(handler.getAllHandlers());
        return handler;
    }
    
    function requestOrbitEnemy(shouldDraw, gl, zOrder, position, opts){
        var handler = new OrbitEnemyHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary);

        addHandlers(handler.getAllHandlers());
        return handler;
    }
    
    function requestRingLightning(shouldDraw, gl, zOrder, position, opts){
        var handler = new RingLightningHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary);

        addHandlers(handler.getAllHandlers());
        return handler;
    }   
    
    function requestTeleportationTargetHandler(shouldDraw, gl, zOrder, position, opts){
        var handler = new TeleportationTargetHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, position, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, sampler: 0});

        addHandlers(handler.getAllHandlers());
        return handler;
    }    
    
    function requestLightningStrikeHandler(shouldDraw, gl, zOrder, lightningStart, lightningEnd, opts){
        var handler = new LightningStrikeHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, lightningStart, lightningEnd, opts, ShaderLibrary, {noiseTexture: simplexNoiseTextureFaster, sampler: 0});

        addHandlers(handler.getAllHandlers());
        return handler;
    }    
    
    function requestGlowingRingHandler(shouldDraw, gl, zOrder, position, opts){
        var handler = new GlowingRingHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, position, ShaderLibrary);

        addHandlers(handler.getAllHandlers());
        return handler;
    }    
    
    function requestSpriteHandler(shouldDraw, gl, zOrder, position, widthAndHeight, opts, texture){
        var handler = new SpriteHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, position, widthAndHeight, ShaderLibrary, {sampler: 0, texture: texture});

        addHandlers(handler.getAllHandlers());
        return handler;
    }    
    
    function requestRectangleHandler(shouldDraw, gl, zOrder, startCoord, endCoord, width, opts){
        var handler = new RectangleHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, startCoord, endCoord, width, ShaderLibrary);

        addHandlers(handler.getAllHandlers());
        return handler;
    }
    
    function getHandlers(){
        var handlersToReturn = [];
        
        for(var i = 0; i < allHandlers.length; i++){
            if(allHandlers[i]._shouldDraw){
                handlersToReturn.push(allHandlers[i]);
            }
        }
        return handlersToReturn;
    }
    
    return {
        initialize: initialize,
        getHandlers: getHandlers,
        requestLightningEffect: requestLightningEffect,
        requestBasicTargetEffect: requestBasicTargetEffect,
        requestTextEffect: requestTextEffect,
        requestCursorEffect: requestCursorEffect,
        requestComboEffect: requestComboEffect,
        requestLightningOrbEffect: requestLightningOrbEffect,
        requestLightningOrbWithStreakEffect: requestLightningOrbWithStreakEffect,
        requestBubblyOrbEffect: requestBubblyOrbEffect,
        requestTriangularTargetEffect: requestTriangularTargetEffect,
        requestFourPointLightningEffect: requestFourPointLightningEffect,
        requestEnemySpikeEffect: requestEnemySpikeEffect,
        requestBasicParticleEffect: requestBasicParticleEffect,
        requestFullScreenColorHandler: requestFullScreenColorHandler,
        requestLifebarHandler: requestLifebarHandler,
        requestTentacleEnemyHandler: requestTentacleEnemyHandler,
        requestOrbitEnemy: requestOrbitEnemy,
        requestRingLightning: requestRingLightning,
        requestTeleportationTargetHandler: requestTeleportationTargetHandler,
        requestLightningStrikeHandler: requestLightningStrikeHandler,
        requestGlowingRingHandler: requestGlowingRingHandler,
        requestSpriteHandler: requestSpriteHandler,
        requestRectangleHandler: requestRectangleHandler
    };
    
});