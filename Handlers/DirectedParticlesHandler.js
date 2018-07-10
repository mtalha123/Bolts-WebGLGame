define(['Handlers/ParticlesHandler', 'Custom Utility/Vector'], function(ParticlesHandler, Vector){    
    function DirectedParticlesHandler(shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary){        
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
            destination: {
                type: "vec2",
                value: [100, 100]
            },
            randomLifetimesOn: {
                type: "float",
                value: [0.0]
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
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.DIRECTED_PARTICLES);
        ParticlesHandler.call(this, shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, position, opts);           
    }   
    
    //inherit from Handler
    DirectedParticlesHandler.prototype = Object.create(ParticlesHandler.prototype);
    DirectedParticlesHandler.prototype.constructor = DirectedParticlesHandler;  
    
    DirectedParticlesHandler.prototype.setDestination = function(destination){
        this._uniforms.destination.value = [destination.getX(), destination.getY()];
    }
    
    DirectedParticlesHandler.prototype.getDestination = function(){
        return new Vector(this._uniforms.destination.value[0], this._uniforms.destination.value[1]);
    } 
    
    DirectedParticlesHandler.prototype.setRadiusOfSource = function(radiusOfSource){
        this._uniforms.radiusOfSource.value[0] = radiusOfSource;
    } 

    return DirectedParticlesHandler;
});