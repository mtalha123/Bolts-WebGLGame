define(['DrawPathWithGlow', 'Custom Utility/Random', 'Third Party/Matrix', 'Custom Utility/Timer'], function(DrawPathWithGlow, Random, Matrix, Timer){
    
    // Arguements: 
    // - 'canvasWidth' is the width of the actual canvas on which the game is drawn 
    // - 'canvasHeight' is the height of the actual canvas on which the game is drawn
    // - 'pathArray' is a multidemensional array which will hold all the subpaths which make up the whole path. Each index in the pathArray is going to be a subpath,
    //   so if multiple indices are contained in pathArray then the lightning piece will consist of multiple subpaths
    // - 'boltpieces' is the amount of boltpieces PER SUBPATH
    // - 'flutuation' is the amount (in pixels) that each subpath is going to flutuate 
    // - 'options' is an optional arguement in case the client of a lightning piece wants the lightning to look different than the default (see "DrawPathWithGlow" to see what can be put in options)
    function LightningPiece(canvasWidth, canvasHeight, pathArray, boltpieces, fluctuation, options){        
        
        var boltPieces = boltpieces;        
        var fluctuation = fluctuation;
        //canvasWidth and canvasHeight are set so that any calculations requiring pixels will use this so that the calculations are all percentages
        this._mainCanvasWidth = canvasWidth;
        this._mainCanvasHeight = canvasHeight;
        //because of the fact that the lightning is going to painted onto a canvas and then that canvas is going to be drawn as an image, there needs to be an offset
        //so that there doesn't appear to be a border or edge around the lightning when it's drawn. These offsets for both 'x' and 'y' represent the amount of pixels that 
        //the lowest X & Y coordinates AND the greatest X & Y coordinates need to be added with in so that there is adequete space around all the subpaths.
        this._offsetX = Math.floor(0.020 * this._mainCanvasWidth) + fluctuation;
        this._offsetY = Math.floor(0.027 * this._mainCanvasHeight) + fluctuation;
        
        //this array will contain all the frames of the animation (all the canvases to which the lightning will be drawn)
        this._lightningCanvasesArray = [];        
        this._numberOfFrames = 20;        
        //these four variables represent the lowest and greatest x & y coordinates in the entire pathArray, meaning all the subpaths. They are initialized so they can be compared
        //in the for loop that is below (cant compare undefined values so they must be initialized)
        this._lowestXCoordinate = pathArray[0][0], this._lowestYCoordinate = pathArray[0][1], this._greatestXCoordinate = pathArray[0][0], this._greatestYCoordinate = pathArray[0][1];        
        
        //this loops through the entire array with all the subpaths and retrieves the appropriate coordinates
        for(var c = 0; c < pathArray.length; c++){
            for(var d = 0; d < pathArray[c].length; d+=2){
                this._lowestXCoordinate = Math.min(this._lowestXCoordinate, pathArray[c][d]);
                this._lowestYCoordinate = Math.min(this._lowestYCoordinate, pathArray[c][d + 1]);

                this._greatestXCoordinate = Math.max(this._greatestXCoordinate, pathArray[c][d]);
                this._greatestYCoordinate = Math.max(this._greatestYCoordinate, pathArray[c][d + 1]);
            }
        }
        
        //these two variables hold the position of the lightning piece created in the global canvas of the game. This will allow the lightning to move from the position it's been created at.
        this._x = this._lowestXCoordinate - this._offsetX;
        this._y = this._lowestYCoordinate - this._offsetY; 
        
        //this loop simply initializes the lightningCanvasesArray and sets it up so lightning can be drawn onto the canvases
        for(var i = 0; i < this._numberOfFrames; i++){
            this._lightningCanvasesArray[i] = document.createElement('canvas');
            this._lightningCanvasesArray[i].width =  (this._greatestXCoordinate - this._lowestXCoordinate) + (this._offsetX * 2);    
            this._lightningCanvasesArray[i].height = (this._greatestYCoordinate - this._lowestYCoordinate) + (this._offsetY * 2);
        }
    
        this._currentFrame = 0;
        //this array will hold all the lightning coordinates for each individual frame of the lightning animation
        var lightningCoordinates = [];

        //the magnitudeX and magnitudeY variables hold the difference between the second pair of coordinates and the first pair
        //these are needed because the vector(given by the two coordinates) needs to be treated as if starting from the origin (i.e. [0, 0]) for calculations involving trigonometry
        var magnitudeX;
        var magnitudeY;
        //the height needs to be the fluctuation * 2 because the flucutation determines how much the lightning is going to fluctuate from a center.
        var heightOfLightningBolts = fluctuation * 2;
        //because there will be many different bolts and possibly many different subpaths, widthOfCurrentBolt holds the width of the bolt that is currently being processed
        var widthOfCurrentBolt;
        //similarly to the width, each bolt also has a specific angle that the lightning generated must be rotated at to meet the requirements of the coordinates given to this object
        var angleOfCurrentBolt;
        
        //Because there can be many subpaths each with many different coordinates, these 4 variables hold the current x and y coordinates being worked with. 
        var currentFirstX, currentFirstY, currentSecondX, currentSecondY;

        //the movingX variable is used to help generate the coordinates of each bolt because each bolt will have potentially MANY bolt PIECES (as specified by the 'boltPieces' variable). The movingX variable will hold the //different 'X' coorindates of each of the bolt pieces. It's been initialzed to the offsetX variable because any lightning bolt being processed will start at this point.
        var movingX = this._offsetX;
        //the generatedY variable will be used with the movingX as it will hold the corresponding 'Y' coorindates of the bolt pieces. It's been initialized to offsetY for the same reason as the 'movingX' variable above
        var generatedY = this._offsetY;

        //the matrix library is going to be used to generate all the transformed coordinates.
        var matrix = new Matrix();
        
        //the following for loop has within it 2 other for loops. These loops do all the processing and actually generate the lightning coordinates. This outermost loop is responsible for looping 
        //the amount of times as has been specified in the numberOfFrames variable. This is because at the end of this loop, lightning will have been generated for one frame.
        for(var a = 0; a < this._numberOfFrames; a++){
            //this loop is responsible for looping for however many subpaths there are. This loop provides the ability to have a lightning piece with many subpaths.
            for(var e = 0; e < pathArray.length; e++){
                //this innermost loop is responsible for actually processing the coordinates within EACH subpath. 
                for(var b = 0; b <= (pathArray[e].length - 4); b+=2){
                    
                    //the first four coordinates are taken from the current subpath being worked on. These coordinates are responsible for the current bolt being worked on.
                    currentFirstX = pathArray[e][b];
                    currentFirstY = pathArray[e][b+1];
                    currentSecondX = pathArray[e][b+2];
                    currentSecondY = pathArray[e][b+3];
                    
                    //the magnitudes are calculated
                    magnitudeX = currentSecondX - currentFirstX;
                    magnitudeY = currentSecondY - currentFirstY;
                    //this is using the Pyhtagorean Theorem to calculate the length between the coordinates currently being worked on.
                    widthOfCurrentBolt = Math.sqrt( (Math.pow(magnitudeX,2) + Math.pow(magnitudeY,2) ) );         
                    
                    //the first coordinates pushed into the big coordinates array represent the X and Y of the current bolt being worked on RELATIVE to the lowest X & Y coordinates. The reason for this is because
                    //each frame of animation (which is a canvas) is independant of the global canvas of the game
                    lightningCoordinates.push([movingX + (currentFirstX - this._lowestXCoordinate), generatedY + (currentFirstY - this._lowestYCoordinate)]);
                    //the angle variables determines the angle IN DEGREES between the horzontal and the vector given by the two coordinates (of the current bolt of the whole path). This variable will be used in rotating the coordinates of all the lightning so the proper orientation is met
                    angleOfCurrentBolt = Math.acos(magnitudeX / Math.sqrt( (Math.pow(magnitudeX,2) + Math.pow(magnitudeY,2) ) ) ) * (180/Math.PI);
                    
                    //this is in case the client provides coordinates that would incur an angle that is negative (e.g. [100, 200, 50, 100])
                    if(magnitudeY < 0){
                        angleOfCurrentBolt *= (-1);
                    }                
                    
                    //the matrix is first translated to the coordinates that have already been pushed into the array (examine the 'push' command above with the array)
                    matrix.translate(lightningCoordinates[lightningCoordinates.length - 1][0], lightningCoordinates[lightningCoordinates.length - 1][1]);
                    //the matrix is rotated by the angle that's been calculated trigonometrically above
                    matrix.rotateDeg(angleOfCurrentBolt);
                    //this final transformation is needed because the GENERATED coordinates are all going to be influenced by the offsets. In order to get the lightning
                    //bolts to be in exact accordance with the coordinates provided by the client, this translation needs to happen to make the whole current frame being drawn
                    //move back
                    matrix.translate(-this._offsetX - (currentFirstX - this._lowestXCoordinate), -this._offsetY - (currentFirstY - this._lowestYCoordinate));
                    
                    //this loop will actually generate all the coordinates for the current bolt being worked on. The reason why it only loops until 'boltPieces-1' as opposed to simply 'boltPieces'
                    //is because the last bolt piece needs to be at a specific point and not a randomly generated point. This is why there is another pair of coordinates that's pushed into the array AFTER the loop
                    for(var i = 0; i < (boltPieces-1); i++){   
                        //generatedY represents the y coordinate of the current bolt piece with regards to the fluctuation.
                        generatedY = Random.getRandomIntInclusive(this._offsetY - fluctuation, this._offsetY + fluctuation);
                        //the movingX variable doesn't need to randomized because since the amount of boltPieces are known, dividing the whole width of the current bolt by the bolt PIECES is how much to move in the X
                        //direction for each Y that's genereated above
                        movingX += Math.floor(widthOfCurrentBolt / boltPieces);         

                        //the movingX and generatedY variables have only generated coordinates that are not in the proper place. Those coordinates need to be transformed so that the lightning actually
                        //is placed correctly. The following statement does that by applying the matrix transformations to the movingX and generatedY variables
                        var generatedPoint = matrix.applyToPoint(movingX + (currentFirstX - this._lowestXCoordinate), generatedY + (currentFirstY - this._lowestYCoordinate));
                        //the transformed coordinates are pushed into the array to be passed for drawing later
                        lightningCoordinates.push([generatedPoint.x, generatedPoint.y]);
                    }
                    
                    //the following three lines repeat the process in the loop with the different being that the generatedY is not randomized for the, possibly, last pair of coordinates.
                    //this is because the lightning needs to fluctuate between the two pairs of coordinates that are currently being worked with. If this was not manually done, then the lightning
                    //would fluctuate on the ends of each bolt in each subpath.
                    movingX += Math.floor( (widthOfCurrentBolt)  / boltPieces);
                    var generatedPoint = matrix.applyToPoint(movingX + (currentFirstX - this._lowestXCoordinate), Math.floor(this._offsetY + (currentFirstY - this._lowestYCoordinate) ));
                    lightningCoordinates.push([generatedPoint.x, generatedPoint.y]);             

                    //the following three lines reset the values to the appropriate ones in order to 'prepare' them for the next iteration of the loop(s)
                    matrix.reset();
                    generatedY = this._offsetY;
                    movingX = this._offsetX;
                }   
                
                //this is now in the second most inner loop. This means that the current subpath's coordinates have all been generated and are ready to be drawn. The following if statement
                //checks to see whether the current subpath is to be closed off or not.
                if(options.closePath){
                    //if the current subpath is be to closed off, then one final pair of coordinates are pushed in which are the same as the first ones for the subpath that is currently
                    //being worked on (this is because closing a subpath means the end and beginning are joined)
                    lightningCoordinates.push([ lightningCoordinates[0][0], lightningCoordinates[0][1] ]);                   
                }
                
                //finally, after all the processing has completed and all the coordinates have been generated, the coordinates are passed to the "DrawPathWithGlow" function with the 
                //context of the current canvas (which is the current animation frame) so that the lightning can be drawn onto the canvas
                DrawPathWithGlow(this._lightningCanvasesArray[a].getContext("2d"), lightningCoordinates, options);
                //the array is reset for the next animation frame
                lightningCoordinates = [];
            }
            
        //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        //         THE FOLLOWING CODE CAN BE UNCOMMENTED IN ORDER TO MAKE THE ANIMATION HAPPEN AT THE FRAME RATE. HOWEVER, THIS SHOULD ONLY BE FOR TESTING PURPOSES
        //         BECAUSE IT MAKES THE ANIMATION DEPENDANT UPON THE FPS AND NOT THE CONSTANT UPDATE RATE

//                    this._lightningCanvasesArray[a].getContext("2d").fillStyle = 'rgba(255, 0, 0, 0.1)';
//                    this._lightningCanvasesArray[a].getContext("2d").fillRect(0, 0, this._lightningCanvasesArray[a].width, this._lightningCanvasesArray[a].height);

        //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            
        }          
    }
    
    //actually draws the lightning piece animation. 
    //Arguments:
    //-The context is the context of the global canvas on which the whole game is being drawn
    //-The interpolation is needed to make the animation look smooth even though there are only 25 updates happening each second
    //-the last two arguements FILL IN LATER
    LightningPiece.prototype.draw = function(context, interpolation, previousX, previousY){  
    
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//         THE FOLLOWING CODE CAN BE UNCOMMENTED IN ORDER TO MAKE THE ANIMATION HAPPEN AT THE FRAME RATE. HOWEVER, THIS SHOULD ONLY BE FOR TESTING PURPOSES
//         BECAUSE IT MAKES THE ANIMATION DEPENDANT UPON THE FPS AND NOT THE CONSTANT UPDATE RATE
        
//        context.drawImage(this._lightningCanvasesArray[this._currentFrame], this._lowestXCoordinate - this._offsetX, this._lowestYCoordinate - this._offsetY);
//        this._currentFrame++;
//        if(this._currentFrame >= this._lightningCanvasesArray.length){
//            this._currentFrame = 0;
//        }
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        
        //context.drawImage(this._lightningCanvasesArray[0], this._x, this._y);
        
        if(Math.round(this._currentFrame + (3 * interpolation)) <= (this._numberOfFrames - 1)){
            //console.log(Math.round(this._currentFrame + (2.4 * interpolation)));
            context.drawImage(this._lightningCanvasesArray[Math.round(this._currentFrame + (3 * interpolation))], this._x, this._y);
        }else{
            context.drawImage(this._lightningCanvasesArray[this._numberOfFrames - 1], this._x, this._y);
        }
    }
    
    LightningPiece.prototype.update = function(){
        this._currentFrame += (60 / this._numberOfFrames);
        if(this._currentFrame >= this._lightningCanvasesArray.length){
            this._currentFrame = 0;
        }
    }
    
    LightningPiece.prototype.getCurrentAnimationFrame = function(){
        return this._currentFrame;
    }
    
    LightningPiece.prototype.setX = function(newX){
        this._x = newX - this._offsetX;
    }
    
    LightningPiece.prototype.setY = function(newY){
        this._y = newY - this._offsetY;
    }
    
    return LightningPiece;
    
});