define(['Custom Utility/getTextInfo', 'Custom Utility/map', 'Handlers/LightningHandler', 'Handlers/TargetHandler', 'Handlers/TextHandler', 'Handlers/CursorHandler', 'Handlers/ComboHandler', 'Handlers/BackgroundFieldHandler', 'Handlers/LightningOrbHandler', 'Handlers/LightningOrbStreakHandler', 'Handlers/BubblyOrbHandler', 'Handlers/TriangularTargetHandler', 'Handlers/FourPointTargetHandler', 'Handlers/SpikeEnemyHandler', 'Handlers/BasicParticlesHandler', 'Handlers/LinkHandler', 'Handlers/FullScreenColorHandler', 'Handlers/LifebarHandler'], function(getTextInfo, map, LightningHandler, TargetHandler, TextHandler, CursorHandler, ComboHandler, BackgroundFieldHandler, LightningOrbHandler, LightningOrbStreakHandler, BubblyOrbHandler, TriangularTargetHandler, FourPointTargetHandler, SpikeEnemyHandler, BasicParticlesHandler, LinkHandler, FullScreenColorHandler, LifebarHandler){
    var allHandlers = [];
    
    var ShaderLibrary;
    var fontTexture;
    var spiderWebTexture;
    var simplexNoiseTexture, worleyNoiseTexture;
    var appMetaData;
    
    
    function initialize(p_ShaderLibrary, p_appMetaData, AssetManager){
        ShaderLibrary = p_ShaderLibrary;
        appMetaData = p_appMetaData;
        
        fontTexture = AssetManager.getTextureAsset("arial");
        spiderWebTexture = AssetManager.getTextureAsset("spiderWeb");
        simplexNoiseTexture = AssetManager.getTextureAsset("simplexNoise");
        worleyNoiseTexture = AssetManager.getTextureAsset("worleyNoise");
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
        var handler = new LightningHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, coords, ShaderLibrary, {noiseTexture: simplexNoiseTexture, width: 1024, height: 1024, sampler: 0}, 1);
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestBasicTargetEffect(shouldDraw, gl, zOrder, x, y, opts){
        var handler = new TargetHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary, {noiseTexture: simplexNoiseTexture, width: 1024, height: 1024, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestTextEffect(shouldDraw, gl, zOrder, opts, x, y, text){
        var handler = new TextHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, ShaderLibrary, {fontTexture: fontTexture, width: 512, height: 512, sampler: 0}, x, y, text);
        
        addHandlers(handler);
        return handler;
    }

    function requestCursorEffect(shouldDraw, zOrder, opts, gl, x, y){
        var handler = new CursorHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, ShaderLibrary, x, y);
        
        addHandlers(handler);
        return handler;
    }
    
    function requestComboEffect(shouldDraw, gl, zOrder, x, y, opts, text){
        var handler = new ComboHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary, {fontTexture: fontTexture, width: 512, height: 512, sampler: 0}, {effectTexture: spiderWebTexture, width: 1024, height: 1024, sampler: 1}, text);
        
        addHandlers(handler);
        return handler;
    }
    
    function requestBackgroundFieldEffect(shouldDraw, gl, zOrder, opts){
        var handler = new BackgroundFieldHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, ShaderLibrary, {noiseTexture: worleyNoiseTexture, sampler: 0});
        
        addHandlers(handler);
        return handler;
    }
    
    function requestLightningOrbEffect(shouldDraw, gl, zOrder, x, y, opts){
        var handler = new LightningOrbHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary, {noiseTexture: simplexNoiseTexture, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }
    
    function requestEnemySpikeEffect(shouldDraw, gl, zOrder, x, y, opts){
        var handler = new SpikeEnemyHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary);
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestLightningOrbWithStreakEffect(shouldDraw, gl, zOrder, x, y, opts){
        var handler = new LightningOrbStreakHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary, {noiseTexture: simplexNoiseTexture, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestBubblyOrbEffect(shouldDraw, gl, zOrder, x, y, opts){
        var handler = new BubblyOrbHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary, {noiseTexture: simplexNoiseTexture, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestTriangularTargetEffect(shouldDraw, gl, zOrder, x, y, opts){
        var handler = new TriangularTargetHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary, {noiseTexture: simplexNoiseTexture, sampler: 0});
        
        addHandlers(handler.getAllHandlers());
        return handler;
    }

    function requestFourPointLightningEffect(shouldDraw, gl, zOrder, x, y, opts){
        var handler = new FourPointTargetHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary, {noiseTexture: simplexNoiseTexture, sampler: 0});

        addHandlers(handler.getAllHandlers());
        return handler;
    }
    
    function requestBasicParticleEffect(shouldDraw, gl, numParticles, zOrder, x, y, opts){
        var handler = new BasicParticlesHandler(shouldDraw, numParticles, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary);

        addHandlers(handler);
        return handler;
    }
    
    function requestLinkHandler(shouldDraw, gl, zOrder, x1, y1, x2, y2, opts){
        var handler = new LinkHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x1, y1, x2, y2, opts, ShaderLibrary);

        addHandlers(handler.getAllHandlers());
        return handler;
    }
    
    function requestFullScreenColorHandler(shouldDraw, zOrder){
        var handler = new FullScreenColorHandler(shouldDraw, zOrder, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), ShaderLibrary);

        addHandlers(handler);
        return handler;
    }
    
    function requestLifebarHandler(shouldDraw, gl, zOrder, x1, y1, x2, y2, opts){
        var handler = new LifebarHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x1, y1, x2, y2, opts, ShaderLibrary);

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
    
    function setUpUniforms(gl, handler){
        var uniforms = handler.getUniforms();
        
        for(var uniformVar in uniforms){
            var uniformLocation = gl.getUniformLocation(handler.getShaderProgram(), uniformVar);
            switch(uniforms[uniformVar].type){
                case "int":
                    gl.uniform1iv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "float":
                    gl.uniform1fv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "vec2":
                    gl.uniform2fv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "vec3":
                    gl.uniform3fv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "vec4":
                    gl.uniform4fv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "sampler2D":
                    if(uniforms[uniformVar].value === 0){
                        gl.activeTexture(gl.TEXTURE0);
                    }else if(uniforms[uniformVar].value === 1){
                        gl.activeTexture(gl.TEXTURE1);
                    }else if(uniforms[uniformVar].value === 2){
                        gl.activeTexture(gl.TEXTURE2);
                    }else if(uniforms[uniformVar].value === 3){
                        gl.activeTexture(gl.TEXTURE3);
                    }else if(uniforms[uniformVar].value === 4){
                        gl.activeTexture(gl.TEXTURE4);
                    }else if(uniforms[uniformVar].value === 5){
                        gl.activeTexture(gl.TEXTURE5);
                    }
                    
                    gl.bindTexture(gl.TEXTURE_2D, uniforms[uniformVar].texture);
                    gl.uniform1i(uniformLocation, uniforms[uniformVar].value);
                    break;
            }
        }
    }
    
    function setUpAttributesAndUniforms(gl, handler){
        var attributes = handler.getAttributes();
        
        for(var attribute in attributes){
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes[attribute]), gl.STATIC_DRAW);
            var attribLocation = gl.getAttribLocation(handler.getShaderProgram(), attribute);
            gl.enableVertexAttribArray(attribLocation);
            if(attribute === "randVals"){
                gl.vertexAttribPointer(attribLocation, 4, gl.FLOAT, false, 0, 0);
            }else{
                gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);
            }
        }
        
        setUpUniforms(gl, handler);
    }
    
    return {
        initialize: initialize,
        getHandlers: getHandlers,
        setUpAttributesAndUniforms: setUpAttributesAndUniforms,
        requestLightningEffect: requestLightningEffect,
        requestBasicTargetEffect: requestBasicTargetEffect,
        requestTextEffect: requestTextEffect,
        requestCursorEffect: requestCursorEffect,
        requestComboEffect: requestComboEffect,
        requestBackgroundFieldEffect: requestBackgroundFieldEffect,
        requestLightningOrbEffect: requestLightningOrbEffect,
        requestLightningOrbWithStreakEffect: requestLightningOrbWithStreakEffect,
        requestBubblyOrbEffect: requestBubblyOrbEffect,
        requestTriangularTargetEffect: requestTriangularTargetEffect,
        requestFourPointLightningEffect: requestFourPointLightningEffect,
        requestEnemySpikeEffect: requestEnemySpikeEffect,
        requestBasicParticleEffect: requestBasicParticleEffect,
        requestLinkHandler: requestLinkHandler,
        requestFullScreenColorHandler: requestFullScreenColorHandler,
        requestLifebarHandler: requestLifebarHandler,
    };
    
});