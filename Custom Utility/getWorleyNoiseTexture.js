define(['Third Party/tooloud.min.js', 'Custom Utility/map', 'Custom Utility/getGlTextureForNoise'], function(tooloud, map, getGLTextureForNoise){
    function getWorleyNoiseTexture(gl, width, height){            
        var textureData = [];

        var xVal = 0 , yVal = 0;
        var noiseValue, color;
        
        for(var i = 0; i < ((width * height) * 3); i+=3){
            noiseValue = tooloud.Worley.Euclidean(7 * (xVal / width), 7 * (yVal / height), 0)[0];
            color = noiseValue * 255;
            
            textureData.push(color);
            textureData.push(color);
            textureData.push(color);

            xVal++;
            if(xVal >= width){
                yVal++;
                xVal = 0;
            }
        }
        
        var noiseTexture = getGLTextureForNoise(gl, textureData, width, height); 
    }
    
    return getWorleyNoiseTexture;
});