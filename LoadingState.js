define(['Custom Utility/Vector'], function(Vector){
    var context;
    var completion = 0.05;
    var textHandler;
    var radius;
    var logo;
    
    function initialize(p_context, canvasWidth, canvasHeight, logoImg, TextManager){
        context = p_context;
        textHandler = TextManager.requestTextHandler("Comic Sans MS", [255, 255, 255, 1.0], canvasHeight * 0.05, new Vector(canvasWidth / 2, canvasHeight / 2), "LOADING", false);
        radius = canvasHeight * 0.15;
        logo = logoImg;
    }
    
    function draw(){        
        var endAngle = (completion * (Math.PI * 2)) - (Math.PI / 2);
        
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        var logoWidth = canvas.height * 0.7;
        var logoHeight = canvas.height * 0.7;
        context.drawImage(logo, (canvas.width / 2) - (logoWidth / 2), (canvas.height / 5) - (logoHeight / 2), logoWidth, logoHeight);
        
        context.strokeStyle = "rgb(0, 111, 255)";
        context.lineWidth = 5;
        context.shadowColor = "rgb(90, 150, 255)";
        context.shadowBlur = 20;
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
        context.stroke();
        
        context.strokeStyle = "yellow";
        context.shadowColor = "rgb(255, 255, 100)";
        context.shadowBlur = 20;
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, radius, -(Math.PI/2), endAngle);
        context.stroke();

        textHandler.shouldDraw(true);
        textHandler.draw();
    }
    
    function update(){
        
    }
    
    function setCompletion(p_completion){
        completion = p_completion;
    }
    
    return {
        setCompletion: setCompletion,
        initialize: initialize,
        draw: draw,
        update: update,
    }
});