define(['Custom Utility/getTextResource', 'Custom Utility/getSimplexNoiseTexture', 'Custom Utility/getGlTextureForImage', 'Custom Utility/getGLTextureForNoise'], function(getTextResource, getSimplexNoiseTexture, getGLTextureForImage, getGLTextureForNoise){
    var numTotalAssets = 32;
    var numLoadedAssets = 0;
    var textures = {};
    var shaders = {};
    var otherTextAssets = {};
    
    function loadAllAssets(gl, callbackForEachLoaded, callbackWhenAllLoaded){
        //load images
        var arialPng = new Image();
        arialPng.src = "Assets/arial.png";
        var spiderWebPng = new Image();
        spiderWebPng.src = "Assets/spiderweb.png";
        var lgBoltPng = new Image();
        lgBoltPng.src = "Assets/lgbolt.png";
        
        Promise.all([
            new Promise(function(resolve, reject){
                arialPng.onload = function(){
                    numLoadedAssets++;
                    var arialTexture = getGLTextureForImage(gl, arialPng);
                    textures.arial = arialTexture;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Arial Texture Loaded");
                }
            }),
            
            new Promise(function(resolve, reject){
                spiderWebPng.onload = function(){
                    numLoadedAssets++;
                    var spiderWebTexture = getGLTextureForImage(gl, spiderWebPng);
                    textures.spiderWeb = spiderWebTexture;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Spider Web Texture Loaded");
                }
            }),          
            
            new Promise(function(resolve, reject){
                lgBoltPng.onload = function(){
                    numLoadedAssets++;
                    var texture = getGLTextureForImage(gl, lgBoltPng);
                    textures.lightningBolt = texture;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Lighning Bolt Web Texture Loaded");
                }
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Assets/arial.fnt", function(error, text){
                    numLoadedAssets++;
                    otherTextAssets.arial = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Arial Font Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
               getTextResource("http://192.168.0.11:4000/Shaders/commonFunctions.glsl", function(error, text){
                   numLoadedAssets++;
                    shaders.commonFunctions = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Common Shader Functions Loaded");
                }); 
            }),
            
            new Promise(function(resolve, reject){
               getTextResource("http://192.168.0.11:4000/Shaders/lightningShaders.glsl", function(error, text){
                   numLoadedAssets++;
                    shaders.lightning = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Lightning Shader Loaded");
                }); 
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/targetShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.target = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Target Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/textShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.text = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Text Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/cursorShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.cursor = text
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Cursor Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/comboShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.combo = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Combo Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/lightningOrbShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.lightning_orb = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Lightning Orb Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/spikeEnemyShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.enemy_spike = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Spike Enemy Shader Loaded");
                });
            }),

            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/orbWithLightningStreakShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.orb_lightning_streak = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Orb With Lightning Streak Shader Loaded");
                });
            }),

            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/bubblyOrbShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.bubbly_orb = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Bubbly Orb Shader Loaded");
                });
            }),

            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/triangularTargetShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.triangular_target = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Triangular Target Shader Loaded");
                });
            }),

            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/fourPointTargetShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.four_point_target = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Four Point Target Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/particleShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.particle = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Particle Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/fullScreenColorShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.full_screen_color = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Full Screen Color Shader Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/lifebarShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.lifebar = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Lifebar Shaders Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/tentacleEnemyShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.tentacle_enemy = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Tentacle Enemy Shaders Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/orbitEnemyShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.enemy_orbit = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Orbit Enemy Shaders Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/ringLightningShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.ring_lightning = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Ring Lightning Shaders Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/teleportationTargetShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.teleportation_target = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Teleportation Target Shaders Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/lightningStrikeShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.lightning_strike = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Lightning Strike Shaders Loaded");
                });
            }),      
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/glowingRingShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.glowing_ring = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Glowing Ring Shaders Loaded");
                });
            }),
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/spriteShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.sprite = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Sprite Shaders Loaded");
                });
            }),            
            
            new Promise(function(resolve, reject){
                getTextResource("http://192.168.0.11:4000/Shaders/rectangleShaders.glsl", function(error, text){
                    numLoadedAssets++;
                    shaders.rectangle = text;
                    callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                    resolve("Rectangle Shaders Loaded");
                });
            }),

            new Promise(function(resolve, reject){
                numLoadedAssets++;
                var noiseTexture = getSimplexNoiseTexture(gl, 2048, 2048, 0.01, 0.6);
                textures.simplexNoiseFaster = noiseTexture;
                callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                resolve("Faster Simplex Noise Data Loaded");
            }),
            
            new Promise(function(resolve, reject){
                numLoadedAssets++;
                var noiseTexture = getSimplexNoiseTexture(gl, 2048, 2048, 0.01, 0.02);
                textures.simplexNoiseSlower = noiseTexture;
                callbackForEachLoaded(numLoadedAssets/numTotalAssets);
                resolve("Slower Simplex Noise Data Loaded");
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