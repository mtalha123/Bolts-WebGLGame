define([], function(){
    function map(in_min, in_max, out_min, out_max, number) {
        return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    
    return map;
});