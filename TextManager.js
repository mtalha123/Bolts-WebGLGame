define([], function(){
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
            this._context.fillStyle = this._color;
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