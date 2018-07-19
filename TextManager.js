define(['timingCallbacks', 'Custom Utility/Vector'], function(timingCallbacks, Vector){
    var context;
    var canvasWidth;
    var canvasHeight;
    
    function TextHandler(context, font, color, size, position, text, shouldDraw){
        this._font = font;
        this._color = color;
        this._shadowColor = "white";
        this._size = size;
        this._position = position;
        this._text = text;
        this._context = context;
        this._shouldDraw = shouldDraw;
    }
    
    TextHandler.prototype.draw = function(){
        if(this._shouldDraw){
            this._context.fillStyle = "rgba(" + this._color.join() + ")";
            this._context.shadowColor = this._shadowColor;
            this._context.font = this._size.toString().concat("px").concat(" ").concat(this._font);
            this._context.fillText(this._text, this._position.getX(), canvasHeight - this._position.getY());
        }
    }
    
    TextHandler.prototype.setText = function(text){
        this._text = text;
    }
        
    TextHandler.prototype.setPosition = function(position){
        this._position = position;
    }
    
    TextHandler.prototype.shouldDraw = function(shouldDraw){
        this._shouldDraw = shouldDraw;
    }   
    
    TextHandler.prototype.setShadowColor = function(shadowColor){
        this._shadowColor = shadowColor;
    }    
    
    TextHandler.prototype.doFadeUpwardsEffect = function(){
        var duration = 1500;
        var distToGoUp = canvasHeight * 0.1;
        var backup_pos = new Vector(this._position.getX(), this._position.getY());
        this._shouldDraw = true;
        
        timingCallbacks.addTimingEvents(this, duration, 1, function(time){
            var completion = time / duration;
            this.setPosition(backup_pos.addTo(new Vector(0, completion * distToGoUp)));
            this._color[3] = 1.0 - completion;
        }, function(){
            this._shouldDraw = false;
            this._color[3] = 1.0;
            this._position = backup_pos;
        });
    }
    
    TextHandler.prototype.doFadeAsGetsBiggerEffect = function(){
        var duration = 2000;
        var normalSize = this._size;
        var sizeIncrease = canvasHeight * 0.05;
        this._shouldDraw = true;
        
        timingCallbacks.addTimingEvents(this, duration, 1, function(time){
            var completion = time / duration;
            this._size = normalSize + (completion * sizeIncrease);
            this._color[3] = 1.0 - completion;
        }, function(){
            this._shouldDraw = false;
            this._color[3] = 1.0;
            this._size -= sizeIncrease;
        });
    }
    
    
    
    function initialize(p_context, p_canvasWidth, p_canvasHeight){
        context = p_context;
        canvasWidth = p_canvasWidth;
        canvasHeight = p_canvasHeight;
        
        context.textAlign = "center";
        context.textBaseline = "middle"; 
        context.shadowBlur = 2;
    }
    
    function requestTextHandler(font, color, size, position, text, shouldDraw){
        return new TextHandler(context, font, color, size, position, text, shouldDraw);
    }
    
    
    return {
        initialize: initialize,
        requestTextHandler: requestTextHandler
    };
});