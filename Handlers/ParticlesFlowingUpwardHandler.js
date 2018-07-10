define(['Handlers/ParticlesHandler'], function(ParticlesHandler){    
    function ParticlesFlowingUpwardHandler(shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary){        
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
                value: [800, 500]
            },
            radiusOfSource: {
                type: "float",
                value: [150]
            },
            maxLifetime: {
                type: "float",
                value: [1000]
            },
            particlesColor: {
                type: "vec3",
                value: [1.0, 1.0, 1.0]
            }
        };  
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.PARTICLES_FLOWING_UPWARD);
        ParticlesHandler.call(this, shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, position, opts);           
    }   
    
    //inherit from Handler
    ParticlesFlowingUpwardHandler.prototype = Object.create(ParticlesHandler.prototype);
    ParticlesFlowingUpwardHandler.prototype.constructor = ParticlesFlowingUpwardHandler;  

    return ParticlesFlowingUpwardHandler;
});