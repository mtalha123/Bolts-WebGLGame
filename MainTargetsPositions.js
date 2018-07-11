define([''], function(){
    var allTargetObjs = [];
    
    function addTargetObj(target, position){
        for(var i = 0; i < allTargetObjs.length; i++){
            if(allTargetObjs[i].target === target){
                // already exists, so just update position
                allTargetObjs[i].position = position;
                return;
            }
        }
        
        allTargetObjs.push({target: target, position: position});
    }
    
    function updateTargetPosition(target, position){
        for(var i = 0; i < allTargetObjs.length; i++){
            if(target === allTargetObjs[i].target){
                allTargetObjs[i].position = position;
                break;
            }
        }
    }
    
    function removeTargetObj(target){
        for(var i = 0; i < allTargetObjs.length; i++){
            if(target === allTargetObjs[i].target){
                allTargetObjs.splice(i, 1);
                break;
            }
        }
    }
    
    function getAllTargetObjs(){
        return allTargetObjs;
    }
    
    return {
        addTargetObj: addTargetObj,
        updateTargetPosition: updateTargetPosition,
        removeTargetObj: removeTargetObj,
        getAllTargetObjs: getAllTargetObjs
    };
});