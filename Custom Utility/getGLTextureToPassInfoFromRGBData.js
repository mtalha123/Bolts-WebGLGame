define([''], function(){
    function getGLTextureToPassInfoFromRGBData(infoInRGB, gl){
        var texture = gl.createTexture();
        var image = new Uint8Array(infoInRGB);
        var length = infoInRGB.length / 3;
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, length, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        return texture;
    }
    
    return getGLTextureToPassInfoFromRGBData;
});