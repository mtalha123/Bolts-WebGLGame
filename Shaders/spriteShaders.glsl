//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 center;
uniform float widthAndHeight;
uniform vec3 color;
uniform vec2 bottomLeftCornerPos;
uniform sampler2D sprite;

void main()
{
	vec2 uv = (gl_FragCoord.xy - bottomLeftCornerPos) / widthAndHeight;
    uv = rotateCoord(uv, iGlobalTime / 50.0, ((center - bottomLeftCornerPos) / widthAndHeight));
    vec4 texColor = texture2D(sprite, uv);    
    texColor = vec4(color, texColor.a);
    gl_FragColor = texColor;
}