define([''], function(){
    //function takes a context, pathData which is to be a multidimensional array of coordinates, and an options object which specifies certain properties that will be applied to path drawn
    return function(context, pathData, options){
        
        //simple check to see if pathData is an array or not. If not, outputs error message.
        if(pathData instanceof Array){
            context.save();
            
            var closePath = false;
            
            //---set options for styles and such------------
            
            //following 5 lines set the defaults (which is regular yellow lightning). These can be overridden by passing in an options object
            var glowIntensity = 5;
            context.lineWidth = 6;
            context.strokeStyle = "#f7ff1c";
            context.shadowBlur = 23;
            context.shadowColor = "#ffffbe";
            
            //override default values if an options object has been passed in
            for(var prop in options){
                if(!options.hasOwnProperty(prop)){
                    continue;
                }
                
                switch(prop){
                    case 'lineWidth':
                        context.lineWidth = options[prop];
                        break;
                        
                    case 'lineColor':
                        context.strokeStyle = options[prop];
                        break;
                        
                    case 'glowRadius':
                        context.shadowBlur = options[prop];
                        break;
                        
                    case 'glowIntensity':
                        glowIntensity = options[prop];
                        break;
                    
                    case 'glowColor':
                        context.shadowColor = options[prop];
                        break;    
                    case 'closePath':
                        closePath = options[prop];
                        break;
                }

            }
            //---------------------------
            
            context.beginPath();
            
            //there are two for loops. The outer loop is there in order to repeat the moveTo command and keep repeating the inner loop
            //this outer loop works by drawing the lines over and over again according to the number passed in through the glowIntensity parameter
            for(var c = 0; c < glowIntensity; c++){
                context.moveTo(pathData[0][0], pathData[0][1]);
                
                //inner loop works by setting the path on the screen (via lineTo) according to the coordinates in the pathData multidimensional array
                for(var i = 0; i < pathData.length; i++){
                    context.lineTo(pathData[i][0], pathData[i][1]);
                }
                if(closePath){
                    context.closePath();   
                }
                //the stroke command occurs after the path has been set on the screen by the inner loop over and over again to make the glow more intense
                context.stroke();
            }
            
            context.restore();
        }else{
            console.error("CUSTOM: DrawPathsWithGlow requires array arguement.")
        }
    }
});