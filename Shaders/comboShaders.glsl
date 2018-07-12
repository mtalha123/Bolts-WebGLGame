//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 center;
uniform float radius;
uniform float spreadOfEdgeEffect;

varying vec2 centerUV;
varying float radiusUV;
varying float spreadOfEdgeEffectUV;

attribute vec2 vertexPosition;

void main(){
    // --------------FOR FRAGMENT SHADER------------------

    //normalize
    centerUV = center.xy / iResolution.xy;
    radiusUV = radius / iResolution.y;
    spreadOfEdgeEffectUV = spreadOfEdgeEffect / iResolution.y;
    
    //take into account aspect ratio
    centerUV.x *= aspectRatio;

    // ----------------------------------------------------
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

vec2 resizeVector(vec2 vector, float lengthToResizeTo){
	return vector * (lengthToResizeTo / length(vector));
}

float anotherApproach(vec2 uv, vec2 center, float radius, float spreadOfEdgeEffect, float time, sampler2D effectTexture){    
    vec2 closestIntersectionPt = center + (normalize(uv - center) * radius);

	vec2 uvOffset = (center - uv);
    vec2 signToUse = sign(uvOffset);
    
    vec2 textureCoord = uv + (vec2(time / 36.6, time / 38.2)) * signToUse;
    float val = smoothstep(0.01,1.2,texture2D(effectTexture, textureCoord).r) * radius;
    uv = uv + resizeVector(uvOffset, val);
    
    float d = distance(uv, closestIntersectionPt);
    return smoothstep(spreadOfEdgeEffect, 0.09, d);
}

uniform float iGlobalTime;
//uniform vec2 center;
uniform float completion;
uniform vec2 iResolution;
uniform float aspectRatio;
//uniform float radius;
//uniform float spreadOfEdgeEffect;
uniform sampler2D effectTexture;

varying vec2 centerUV;
varying float radiusUV;
varying float spreadOfEdgeEffectUV;

void main()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= aspectRatio;

    
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    
    float distToCenter = distance(uv, centerUV);
    float angleOfCompletion = (PI/ 2.0) +  ( (-2.0 * PI) * completion );
    float uvAngle = getUVAngleDeg(uv, centerUV) * (PI / 180.0);
    
    if(uvAngle > (PI / 2.0)){
    	uvAngle -= (2.0 * PI);
    }
    
    if(distToCenter > radiusUV){
        if(!(uvAngle <= (PI / 2.0) && uvAngle >= angleOfCompletion)){
            if(anotherApproach(uv, centerUV, radiusUV, spreadOfEdgeEffectUV, iGlobalTime / 10.0, effectTexture) == 0.0){
    	       color = vec4(1.0, 0.0, 0.4, 1.0); 
            }   
        }
    }
    
	gl_FragColor = color;
}