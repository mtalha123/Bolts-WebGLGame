define([''], function(){
    var coordinates = [];
    var lineWidth, midPointX, midPointY, radius, lowestX, lowestY, largestX, largestY;
    
//    function initialize(canvasWidth, canvasHeight, numLines, margin){
//        var degreeIncrement = 180 / numLines;
//        
//        lineWidth = 0.003 * canvasHeight;
//        
//        lowestX = margin;
//        lowestY = margin;
//        largestX = canvasWidth - margin;
//        largestY = canvasHeight - margin;                
//        midPointX = (largestX / 2) - lowestX;
//        midPointY = (largestY / 2) - lowestY;
//        
//        radius = 100;
//        var currentAngle = (-90) + degreeIncrement;
//        var currentX, currentY, destinationX = 0, destinationY = 0;
//        
////        for(var i = 0; i < numLines; i++){
////            currentX = Math.cos(currentAngle * (Math.PI / 180)) * radius;
////            currentY = Math.sin(currentAngle * (Math.PI / 180)) * radius;
////            
////            currentX += midPointX;
////            currentY += midPointY;
////            
////            if(destinationX != largestX && destinationY === lowestY){
////                destinationY = lowestY;
////                destinationX = Math.abs(destinationY / Math.tan(currentAngle)); 
////
////                coordinates.push([currentX, currentY]);
////                coordinates.push([destinationX, destinationY]);
////            }
////            
////            if(destinationX === largestX){}
//////            console.log(currentX);
//////            console.log(currentY);
//////            console.log(borderX);
//////            console.log(borderY);
////            
////            currentAngle += degreeIncrement;
////            
//        }
//    }
    
    function initialize(canvasWidth, canvasHeight, numLines, margin){
        var increment = Math.round((canvasWidth + canvasHeight) / numLines);
        
        midPointX = canvasWidth / 2;
        midPointY = canvasHeight / 2;
        
        var currentX = margin;
        var currentY = midPointY;
        
        lineWidth = 0.002 * canvasHeight;
        
        for(var a = 0; a < numLines; a++){
            
            if(currentY > margin && currentX === margin){                
                if(currentY - increment < margin){
                    currentX += increment - (currentY - margin);
                    currentY = margin;
                }else{
                    coordinates.push([currentX, currentY]);
                    console.log("FIRST COORDINATE PUSHED: [" + currentX + ', ' + currentY + ']');
                    coordinates.push([canvasWidth - margin, midPointY + (midPointY  - currentY)]);
                    console.log("SECOND COORDINATE PUSHED: [" + (canvasWidth - margin) + ', ' + (midPointY + (midPointY  - currentY)) + ']');
                    currentY -= increment;
                }
            }
            
            if(currentY === margin){
                if(currentX + increment > (canvasWidth - margin)){
                    currentY += increment - ((canvasWidth - margin) - currentX);
                    currentX = canvasWidth - margin;
                }else{
                    coordinates.push([currentX, currentY]);
//                    console.log("FIRST COORDINATE PUSHED: [" + currentX + ', ' + currentY + ']');
                    coordinates.push([(canvasWidth - margin) - (currentX - margin), canvasHeight - margin]);
//                    console.log("SECOND COORDINATE PUSHED: [" + (canvasWidth - margin) + ', ' + (midPointY + (midPointY  - currentY)) + ']');
                    currentX += increment;
                }
            }
            
            if(currentY >= margin && currentX === (canvasWidth - margin)){
                if(!(currentY + increment > midPointY)){
                    coordinates.push([currentX, currentY]);
                    //console.log("FIRST COORDINATE PUSHED: [" + currentX + ', ' + currentY + ']');
                    coordinates.push([margin, (canvasHeight - margin) - (currentY - margin)]);
                   // console.log("SECOND COORDINATE PUSHED: [" + (canvasWidth - margin) + ', ' + (midPointY + (midPointY  - currentY)) + ']');
                    currentY += increment;
                }
            }
            
        }

    }
    
    var d = 0;
    var x = 2;
    
    function draw(context){
        context.save();
        
        context.strokeStyle = "rgb(0, 0, " + d + ")";
        context.lineWidth = lineWidth;
        
        context.beginPath();        
        for(var b = 0; b < coordinates.length - 1; b+=2){
            context.moveTo(coordinates[b][0], coordinates[b][1]);
            context.lineTo(coordinates[b + 1][0], coordinates[b + 1][1]);
        }
        
        context.stroke();
        
        context.beginPath();
        context.lineWidth = 10;
        context.arc(midPointX, midPointY, 100, 0, 2 * Math.PI, false);
        context.fillStyle = "#a6a6a6";
        context.strokeStyle = "rgb(0, 0, " + d + ")";
        context.fill();
        context.stroke();
        context.stroke();
        
        context.restore();
        
        d+=x;
        if(d > 255){
            d--;
            x *= (-1);
        }
        if(d < 0){
            d++;
            x *= (-1);
        }
    }
    
    return {
        initialize: initialize,
        draw: draw
    
    };
    
    
    
    
    
    
    
//     function initialize(canvasWidth, canvasHeight, numLines, margin){
//        var increment = Math.round((canvasWidth + canvasHeight) / numLines);
//        
//        var midPointX = canvasWidth / 2;
//        var midPointY = canvasHeight / 2;
//        
//        var currentX = margin;
//        var currentY = midPointY;
//        
//        lineWidth = 0.002 * canvasHeight;
//        
//        for(var a = 0; a < numLines; a++){
//            
//            if(currentY > margin && currentX === margin){                
//                if(currentY - increment < margin){
//                    currentX += increment - (currentY - margin);
//                    currentY = margin;
//                }else{
//                    coordinates.push([currentX, currentY]);
//                    console.log("FIRST COORDINATE PUSHED: [" + currentX + ', ' + currentY + ']');
//                    coordinates.push([canvasWidth - margin, midPointY + (midPointY  - currentY)]);
//                    console.log("SECOND COORDINATE PUSHED: [" + (canvasWidth - margin) + ', ' + (midPointY + (midPointY  - currentY)) + ']');
//                    currentY -= increment;
//                }
//            }
//            
//            if(currentY === margin){
//                if(currentX + increment > (canvasWidth - margin)){
//                    currentY += increment - ((canvasWidth - margin) - currentX);
//                    currentX = canvasWidth - margin;
//                }else{
//                    coordinates.push([currentX, currentY]);
////                    console.log("FIRST COORDINATE PUSHED: [" + currentX + ', ' + currentY + ']');
//                    coordinates.push([(canvasWidth - margin) - (currentX - margin), canvasHeight - margin]);
////                    console.log("SECOND COORDINATE PUSHED: [" + (canvasWidth - margin) + ', ' + (midPointY + (midPointY  - currentY)) + ']');
//                    currentX += increment;
//                }
//            }
//            
//            if(currentY >= margin && currentX === (canvasWidth - margin)){
//                if(!(currentY + increment > midPointY)){
//                    coordinates.push([currentX, currentY]);
//                    //console.log("FIRST COORDINATE PUSHED: [" + currentX + ', ' + currentY + ']');
//                    coordinates.push([margin, (canvasHeight - margin) - (currentY - margin)]);
//                   // console.log("SECOND COORDINATE PUSHED: [" + (canvasWidth - margin) + ', ' + (midPointY + (midPointY  - currentY)) + ']');
//                    currentY += increment;
//                }
//            }
//            
//        }
//
//    }
    
});