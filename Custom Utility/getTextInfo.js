define(['Custom Utility/getTextResource'], function(getTextResource){
    var fontInformation = {};
    var ASCIICodes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 120];
    
    getTextResource("http://192.168.0.11:4000/Assets/arial.fnt", fontInfoLoaded);
    
    function fontInfoLoaded(error, text){
        for(var i = 0; i < ASCIICodes.length; i++){
            var character = String.fromCharCode(ASCIICodes[i]);
            
            var startOfLineIndex = text.indexOf("char id=" + ASCIICodes[i]);
            
            var infoIndex = text.indexOf("x=", startOfLineIndex);
            var endOfNumIndex = text.indexOf(" ", infoIndex);
            var x = parseInt( text.substring(infoIndex + 2, endOfNumIndex) );
            
            infoIndex = text.indexOf("y=", startOfLineIndex);
            endOfNumIndex = text.indexOf(" ", infoIndex);
            var y = parseInt( text.substring(infoIndex + 2, endOfNumIndex) );
            
            infoIndex = text.indexOf("width=", startOfLineIndex);
            endOfNumIndex = text.indexOf(" ", infoIndex);
            var width = parseInt( text.substring(infoIndex + 6, endOfNumIndex) );
            
            infoIndex = text.indexOf("height=", startOfLineIndex);
            endOfNumIndex = text.indexOf(" ", infoIndex);
            var height = parseInt( text.substring(infoIndex + 7, endOfNumIndex) );
            
            infoIndex = text.indexOf("xoffset=", startOfLineIndex);
            endOfNumIndex = text.indexOf(" ", infoIndex);
            var xoffset = parseInt( text.substring(infoIndex + 8, endOfNumIndex) );
            
            infoIndex = text.indexOf("yoffset=", startOfLineIndex);
            endOfNumIndex = text.indexOf(" ", infoIndex);
            var yoffset = parseInt( text.substring(infoIndex + 8, endOfNumIndex) );
            
            infoIndex = text.indexOf("xadvance=", startOfLineIndex);
            endOfNumIndex = text.indexOf(" ", infoIndex);
            var xadvance = parseInt( text.substring(infoIndex + 9, endOfNumIndex) );
            
            fontInformation[character] = {
                x: x,
                y: y,
                width: width,
                height: height,
                xoffset: xoffset,
                yoffset: yoffset,
                xadvance: xadvance
            };            
        }
    }
    
    function getInfoForString(string){
        var returnObject = {};
        for(var i = 0; i < string.length; i++){
            returnObject[string[i]] = fontInformation[string[i]];
        }
        
        return returnObject;
    }
    
    return getInfoForString;
});