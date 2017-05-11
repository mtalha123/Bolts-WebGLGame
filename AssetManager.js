define(['Custom Utility/getTextResource', 'Custom Utility/getNoiseTexture', 'Custom Utility/getGlTextureForImage', 'Custom Utility/getGLTextureForNoise'], function(getTextResource, getNoiseTexture, getGLTextureForImage, getGLTextureForNoise){
    var numTotalAssets = 8;
    var textures = {};
    var shaders = {};
    var otherTextAssets = {};
    
    function loadAllAssets(gl, callbackForEachLoaded, callbackWhenAllLoaded){
        //load images
        var arialPng = new Image();
        arialPng.src = "Assets/arial.png";
        
        Promise.all([
            new Promise(function(resolve, reject){
                arialPng.onload = function(){
                    var arialTexture = getGLTextureForImage(gl, arialPng);
                    textures.arial = arialTexture;
                    callbackForEachLoaded();
                    resolve("Arial Texture Loaded");
                }
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.15:4000/Assets/arial.fnt", function(error, text){
                    otherTextAssets.arial = text;
                    callbackForEachLoaded();
                    resolve("Arial Font Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
               getTextResource("http://192.168.0.15:4000/Shaders/lightningShaders.glsl", function(error, text){                    
                    shaders.lightning = text;
                    callbackForEachLoaded();
                    resolve("Lightning Shader Loaded");
                }); 
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.15:4000/Shaders/targetShaders.glsl", function(error, text){
                    shaders.target = text;
                    callbackForEachLoaded();
                    resolve("Target Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.15:4000/Shaders/textShaders.glsl", function(error, text){
                    shaders.text = text;
                    callbackForEachLoaded();
                    resolve("Text Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.15:4000/Shaders/cursorShaders.glsl", function(error, text){
                    shaders.cursor = text
                    callbackForEachLoaded();
                    resolve("Cursor Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.15:4000/Shaders/comboShaders.glsl", function(error, text){
                    shaders.combo = text;
                    callbackForEachLoaded();
                    resolve("Combo Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                var noiseData = getNoiseTexture(1024, 1024);
                var noiseTexture = getGLTextureForNoise(gl, noiseData, 1024, 1024);
                textures.noise = noiseTexture;
                callbackForEachLoaded();
                resolve("Noise Data Loaded");
            }),
        ]).then(function(){
            callbackWhenAllLoaded();
        });
    }
    
    function getTextureAsset(resourceString, optReturnAll){
        if(optReturnAll){
            return textures;
        }
        return textures[resourceString];
    }
    
    function getShaderAsset(resourceString, optReturnAll){
        if(optReturnAll){
            return shaders;
        }
        return shaders[resourceString];
    }
    
    function getTextAsset(resourceString, optReturnAll){
        if(optReturnAll){
            return otherTextAssets;
        }
        return otherTextAssets[resourceString];
    }
    
    function getNumTotalAssets(){
        return numTotalAssets;
    }
    
    return {
        loadAllAssets: loadAllAssets,
        getTextureAsset: getTextureAsset,
        getShaderAsset: getShaderAsset,
        getTextAsset: getTextAsset,
        getNumTotalAssets: getNumTotalAssets,
    };
});