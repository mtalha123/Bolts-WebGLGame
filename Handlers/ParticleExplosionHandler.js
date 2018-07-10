define(['Handlers/ParticlesHandler'], function(ParticlesHandler){    
    function ParticleExplosionHandler(shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary){        
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
            radiusOfExplosion: {
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
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.PARTICLE_EXPLOSION);          
        ParticlesHandler.call(this, shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, position, opts); 
    }   
    
    //inherit from Handler
    ParticleExplosionHandler.prototype = Object.create(ParticlesHandler.prototype);
    ParticleExplosionHandler.prototype.constructor = ParticleExplosionHandler;  

    return ParticleExplosionHandler;
});