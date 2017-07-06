//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795

vec2 resizeVector(vec2 vector, float lengthToResizeTo){
	return vector * (lengthToResizeTo / length(vector));
}

float getUVAngleDeg(vec2 uv, vec2 center){
	vec2 uv_t = uv - center;
    
    if(uv_t.x == 0.0){
        if(uv_t.y >= 0.0){
        	return 90.0;
        }
        
        if(uv_t.y < 0.0){
        	return -90.0;
        }
    }
    
    float angle;
    angle = atan(uv_t.y, uv_t.x);
    //convert to degrees
    angle *= (180.0 / PI);
    
    if(angle < 0.0){
    	angle = 180.0 + (180.0 - abs(angle));
    }
    return angle;
}

float map(float in_min, float in_max, float out_min, float out_max, float number) {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

bool isInRect(vec2 testCoord, vec2 lowerLeftCoord, vec2 upperRightCoord){
    if(testCoord.x >= lowerLeftCoord.x && testCoord.x <= upperRightCoord.x){
        if(testCoord.y >= lowerLeftCoord.y && testCoord.y <= upperRightCoord.y){
            return true;    
        }
    }
    
    return false;
}

float anotherApproach(vec2 uv, vec2 centerUV, float radiusFromTextUV, float radiusOfEdgeEffectUV, float spreadOfEdgeEffectUV, float time, sampler2D effectTexture){    
    vec2 closestIntersectionPt = centerUV + (normalize(uv - centerUV) * radiusFromTextUV);

	vec2 uvOffset = (centerUV - uv);
    vec2 signToUse = sign(uvOffset);
    
    vec2 textureCoord = uv + (vec2(time / 36.6, time / 38.2)) * signToUse;
    float val = smoothstep(0.01,1.2,texture2D(effectTexture, textureCoord).r) * radiusOfEdgeEffectUV;
    uv = uv + resizeVector(uvOffset, val);
    
    float d = distance(uv, closestIntersectionPt);
    return smoothstep(spreadOfEdgeEffectUV, 0.09, d);
}

float getAlphaForCharacter(vec2 uv, vec2 startCoord, vec2 endCoord, vec2 startTexCoord, vec2 endTexCoord, sampler2D fontTexture){
    float xMapped = map(startCoord.x, endCoord.x, startTexCoord.x, endTexCoord.x, uv.x);
    float yMapped = map(startCoord.y, endCoord.y, startTexCoord.y, endTexCoord.y, uv.y);
    vec4 texel = texture2D(fontTexture, vec2(xMapped, yMapped));
    float dist = 1.0 - texel.a;
    float alpha = 1.0 - smoothstep(0.5, 0.6, dist);
    return alpha;
}

uniform float time;
uniform vec2 center;
uniform float completion;
uniform vec2 iResolution;
uniform float radiusFromText;
uniform float radiusOfEdgeEffect;
uniform float spreadOfEdgeEffect;
uniform vec4 firstTextCoords;
uniform vec4 firstCharCoords;
uniform vec4 secondTextCoords;
uniform vec4 secondCharCoords;
uniform vec4 thirdTextCoords;
uniform vec4 thirdCharCoords;
uniform sampler2D fontTexture;
uniform sampler2D effectTexture;

void main()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = (iResolution.x / iResolution.y);
    
    //normalize
    vec2 centerUV = center.xy / iResolution.xy;
    float radiusFromTextUV = radiusFromText / iResolution.y;
    float radiusOfEdgeEffectUV = radiusOfEdgeEffect / iResolution.y;
    float spreadOfEdgeEffectUV = spreadOfEdgeEffect / iResolution.y;
    vec4 firstCharCoordsUV = firstCharCoords / iResolution.xyxy;
    vec4 secondCharCoordsUV = secondCharCoords / iResolution.xyxy;
    vec4 thirdCharCoordsUV = thirdCharCoords / iResolution.xyxy;
    
    //take into account aspect ratio
    uv.x *= aspectRatio;
    centerUV.x *= aspectRatio;
    firstCharCoordsUV.rb *= aspectRatio;
    secondCharCoordsUV.rb *= aspectRatio;
    thirdCharCoordsUV.rb *= aspectRatio;
    
    
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    if(isInRect(uv, firstCharCoordsUV.rg, firstCharCoordsUV.ba)){
        float alpha = getAlphaForCharacter(uv, firstCharCoordsUV.rg, firstCharCoordsUV.ba, vec2(firstTextCoords.r, firstTextCoords.g), vec2(firstTextCoords.b, firstTextCoords.a), fontTexture);
        color = vec4(1.0, 0.0, 0.0, alpha);
    }

    if(isInRect(uv, secondCharCoordsUV.rg, secondCharCoordsUV.ba)){
        float alpha = getAlphaForCharacter(uv, secondCharCoordsUV.rg, secondCharCoordsUV.ba, vec2(secondTextCoords.r, secondTextCoords.g), vec2(secondTextCoords.b, secondTextCoords.a), fontTexture);
        color = vec4(1.0, 0.0, 0.0, alpha);
    }
    
    if(isInRect(uv, thirdCharCoordsUV.rg, thirdCharCoordsUV.ba)){
        float alpha = getAlphaForCharacter(uv, thirdCharCoordsUV.rg, thirdCharCoordsUV.ba, vec2(thirdTextCoords.r, thirdTextCoords.g), vec2(thirdTextCoords.b, thirdTextCoords.a), fontTexture);
        color = vec4(1.0, 0.0, 0.0, alpha);
    }
    
    float distToCenter = distance(uv, centerUV);
    float angleOfCompletion = (PI/ 2.0) +  ( (-2.0 * PI) * completion );
    float uvAngle = getUVAngleDeg(uv, centerUV) * (PI / 180.0);
    
    if(uvAngle > (PI / 2.0)){
    	uvAngle -= (2.0 * PI);
    }
    
    if(distToCenter > (radiusFromTextUV)){
        if(!(uvAngle <= (PI / 2.0) && uvAngle >= angleOfCompletion)){
            if(anotherApproach(uv, centerUV, radiusFromTextUV, radiusOfEdgeEffectUV, spreadOfEdgeEffectUV, time, effectTexture) == 0.0){
    	       color = vec4(1.0, 0.0, 0.4, 1.0); 
            }   
        }
    }
    
	gl_FragColor = color;
}