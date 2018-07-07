define([], function(){
    var audioContext = new AudioContext(); 
    var audioBuffers = {};
    
    
    function AudioHandler(buffer, shouldLoop){
        this._buffer = buffer;
        this._volume = 1.0;
        this._shouldLoop = shouldLoop;
        this._source = undefined;
        this._gain = undefined;
    }
    
    AudioHandler.prototype.play = function(){
        this._source = audioContext.createBufferSource();
        this._gain = audioContext.createGain();
        
        this._source.buffer = this._buffer;
        this._source.loop = this._shouldLoop;
        this._source.connect(this._gain);
        this._gain.connect(audioContext.destination);
        this._gain.gain.setValueAtTime(this._volume, audioContext.currentTime);
        this._source.start(0);
    }    
    
    AudioHandler.prototype.setVolume = function(volume){
        this._volume = volume;
        this._gain.gain.setValueAtTime(this._volume, audioContext.currentTime);
    }
    
    
    function initialize(AssetManager, callbackWhenAllAudioDecoded){
        var audioAssets = AssetManager.getAudioAsset(null, true);
        var promises = [];
        var allKeys = Object.keys(audioAssets);
        
        for(var key in audioAssets){
            (function(key){
                promises.push(new Promise(function(resolve, reject){
                    audioContext.decodeAudioData(audioAssets[key], function(buffer){
                        audioBuffers[key] = buffer;
                        resolve();
                    }, function(err){
                        alert("Audio Error: " + err);
                    });
                }))
            })(key);
        }
        
        Promise.all(promises).then(callbackWhenAllAudioDecoded);
    }
    
    function getAudioHandler(audioName, shouldLoop){
        return new AudioHandler(audioBuffers[audioName], shouldLoop);
    }
    
    return {
        initialize: initialize,
        getAudioHandler: getAudioHandler
    };
});