define([''], function(){
    var context;
    var completion = 0.05;
    
    function initialize(p_context){
        context = p_context;
    }
    
    function draw(){
        var endAngle = (completion * (Math.PI * 2)) - (Math.PI / 2);
        
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.strokeStyle = "rgb(0, 111, 255)";
        context.lineWidth = 5;
        context.shadowColor = "rgb(90, 150, 255)";
        context.shadowBlur = 20;
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
        context.stroke();
        
        context.strokeStyle = "yellow";
        context.shadowColor = "rgb(255, 255, 100)";
        context.shadowBlur = 20;
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, 100, -(Math.PI/2), endAngle);
        context.stroke();

        context.fillStyle = "white";
        context.font = '40px serif';
        context.textAlign = "center";
        context.textBaseline = "middle"; 
        context.shadowBlur = 0;
        context.fillText("Loading", (canvas.width / 2), canvas.height / 2);
    }
    
    function update(){
        
    }
    
    function setCompletion(p_completion){
        completion = p_completion;
    }
    
    function clear(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    return {
        setCompletion: setCompletion,
        initialize: initialize,
        draw: draw,
        update: update,
        clear: clear
    }
});