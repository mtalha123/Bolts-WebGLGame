define(['Handlers/Handler', 'Custom Utility/Vector', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getVerticesNormalized'], function(Handler, Vector, getGLCoordsFromNormalizedShaderCoords, getVerticesNormalized){
    
    function RectangleHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, startCoord, endCoord, width, ShaderLibrary){
        this._uniforms = {
            color: {
                type: "vec4",
                value: [1.0, 0.0, 0.0, 1.0]
            },
        };
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.RECTANGLE);        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts); 
        this._startCoord = startCoord;
        this._endCoord = endCoord;
        this._width = width;  
        this._generateVerticesFromCurrentState();
    }
    
    //inherit from Handler
    RectangleHandler.prototype = Object.create(Handler.prototype);
    RectangleHandler.prototype.constructor = RectangleHandler; 
    
    RectangleHandler.prototype.setCoords = function(startCoord, endCoord){
        this._startCoord = startCoord;
        this._endCoord = endCoord;

        this._generateVerticesFromCurrentState();
    }   
    
    RectangleHandler.prototype.setEndCoord = function(endCoord){
        this.setCoords(this._startCoord, endCoord)
    }  
    
    RectangleHandler.prototype._generateVerticesFromCurrentState = function(){
        var dirVec = (this._endCoord.subtract(this._startCoord)).getNormalized();
        var perp1 = new Vector(-dirVec.getY(), dirVec.getX());
        var perp2 = new Vector(dirVec.getY(), -dirVec.getX());
        
        perp1 = perp1.multiplyWithScalar(this._width);
        perp2 = perp2.multiplyWithScalar(this._width);

        var firstVertex = this._startCoord.addTo(perp1);
        var secondVertex = this._startCoord.addTo(perp2);
        var thirdVertex = this._endCoord.addTo(perp1);
        var fourthVertex = this._endCoord.addTo(perp2);

        var vertices = [firstVertex.getX(), firstVertex.getY(), secondVertex.getX(), secondVertex.getY(), thirdVertex.getX(), thirdVertex.getY(), thirdVertex.getX(), thirdVertex.getY(), secondVertex.getX(), secondVertex.getY(), fourthVertex.getX(), fourthVertex.getY()];

        //normalize
        for(var a = 0; a < vertices.length-1; a+=2){
            vertices[a] /= this._canvasWidth; 
            vertices[a+1] /= this._canvasHeight; 
        }
        
        this._attributes.vertexPosition.value = getGLCoordsFromNormalizedShaderCoords(vertices);
    }

    return RectangleHandler;
});