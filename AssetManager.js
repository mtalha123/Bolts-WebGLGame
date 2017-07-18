define(['Custom Utility/getTextResource', 'Custom Utility/getSimplexNoiseTexture', 'Custom Utility/getWorleyNoiseTexture', 'Custom Utility/getGlTextureForImage', 'Custom Utility/getGLTextureForNoise'], function(getTextResource, getSimplexNoiseTexture, getWorleyNoiseTexture, getGLTextureForImage, getGLTextureForNoise){
    var numTotalAssets = 8;
    var textures = {};
    var shaders = {};
    var otherTextAssets = {};
    
    function loadAllAssets(gl, callbackForEachLoaded, callbackWhenAllLoaded){
        //load images
        var arialPng = new Image();
        arialPng.src = "Assets/arial.png";
        var spiderWebPng = new Image();
        spiderWebPng.src = "Assets/spiderweb.png";
        
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
                spiderWebPng.onload = function(){
                    var spiderWebTexture = getGLTextureForImage(gl, spiderWebPng);
                    textures.spiderWeb = spiderWebTexture;
                    callbackForEachLoaded();
                    resolve("Spider Web Texture Loaded");
                }
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.18:4000/Assets/arial.fnt", function(error, text){
                    otherTextAssets.arial = text;
                    callbackForEachLoaded();
                    resolve("Arial Font Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
               getTextResource("http://192.168.0.18:4000/Shaders/commonFunctions.glsl", function(error, text){                    
                    shaders.commonFunctions = text;
                    callbackForEachLoaded();
                    resolve("Common Shader Functions Loaded");
                }); 
            }),
            
            new Promise(function(resolve, reject){
               getTextResource("http://192.168.0.18:4000/Shaders/lightningShaders.glsl", function(error, text){                    
                    shaders.lightning = text;
                    callbackForEachLoaded();
                    resolve("Lightning Shader Loaded");
                }); 
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.18:4000/Shaders/targetShaders.glsl", function(error, text){
                    shaders.target = text;
                    callbackForEachLoaded();
                    resolve("Target Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.18:4000/Shaders/textShaders.glsl", function(error, text){
                    shaders.text = text;
                    callbackForEachLoaded();
                    resolve("Text Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.18:4000/Shaders/cursorShaders.glsl", function(error, text){
                    shaders.cursor = text
                    callbackForEachLoaded();
                    resolve("Cursor Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.18:4000/Shaders/comboShaders.glsl", function(error, text){
                    shaders.combo = text;
                    callbackForEachLoaded();
                    resolve("Combo Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.18:4000/Shaders/backgroundFieldShaders.glsl", function(error, text){
                    shaders.background_field = text;
                    callbackForEachLoaded();
                    resolve("Background Field Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                var noiseData = getSimplexNoiseTexture(2048, 2048);
                var noiseTexture = getGLTextureForNoise(gl, noiseData, 2048, 2048);
                textures.simplexNoise = noiseTexture;
                callbackForEachLoaded();
                resolve("Simplex Noise Data Loaded");
            }),
            
            new Promise(function(resolve, reject){
                var noiseData = getWorleyNoiseTexture(512, 512);
                var noiseTexture = getGLTextureForNoise(gl, noiseData, 512, 512);
                textures.worleyNoise = noiseTexture;
                callbackForEachLoaded();
                resolve("Worley Noise Data Loaded");
            })
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