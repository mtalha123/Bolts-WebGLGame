//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795 

vec2 getPointOnArrow(vec2 startCoord, vec2 endCoord, vec2 projVec){
    return clamp(startCoord + projVec, min(startCoord, endCoord), max(startCoord, endCoord));
}

float getAngleInStandardPosition(vec2 vec){
    return acos(vec.x / length(vec));
}

uniform vec2 iResolution;
uniform vec2 center;
uniform float widthAndHeight;
uniform vec2 bottomLeftCornerPos;
uniform float completion;
uniform sampler2D arrowTexture;

void main()
{
    vec2 uv = (gl_FragCoord.xy - bottomLeftCornerPos.xy) / widthAndHeight;
    
    //normalize
    vec2 center = (center - bottomLeftCornerPos).xy / widthAndHeight;
    float radius = (widthAndHeight / 2.0) / iResolution.y;
    
    float angleToRotateArrow = PI / 4.0;
    
    uv = rotateCoord(uv, -angleToRotateArrow, center);
    vec2 startOfArrow = rotateCoord(vec2(center.x + radius, center.y), -angleToRotateArrow, center);
    vec2 endOfArrow = rotateCoord(vec2(center.x - radius, center.y), angleToRotateArrow, center);
    
    vec2 startOfArrowToUV = uv - startOfArrow;
    vec2 projVec = getProjectedVector(startOfArrowToUV, endOfArrow - startOfArrow);
    vec2 pointOnSegment = getPointOnArrow(startOfArrow, endOfArrow, projVec);
    
    vec4 color = texture2D(arrowTexture, uv);
    
    if(length(pointOnSegment - startOfArrow) > (completion * length(endOfArrow - startOfArrow))){
        color.a = 0.0;     
    }

	gl_FragColor = color;
}