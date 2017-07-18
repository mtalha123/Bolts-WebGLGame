//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

const int MAX_ITERATIONS = 10;

uniform float iGlobalTime;
uniform vec2 iResolution;
uniform int numCoords;
uniform float widthOfCoordsTexture;
uniform float glowFactor;
uniform float fluctuation;
uniform float lineWidth;
uniform vec3 boltColor;
uniform vec3 glowColor;
uniform sampler2D noise;
uniform sampler2D coords;

void main(){
	vec2 uv = gl_FragCoord.xy / iResolution.xy; 
    float aspectRatio = iResolution.x / iResolution.y;
    
    //normalize
    float lineWidthUV = lineWidth / iResolution.y; 
    float fluctuationUV = fluctuation / iResolution.y;
    
    //take into account aspect ratio    
    uv.x *= aspectRatio;
        
    vec2 uv_t;
    vec2 lightningStart, lightningEnd; 
    float lengthOfLightning;
    float testDistance, distanceToPoint = 1000.0;
    vec3 finalColor = vec3(1.0);
    float xClamped, yNoiseVal;
    vec2 pointOnLightning;
       
    for(int i = 0; i < MAX_ITERATIONS; i++){
        if(i == (numCoords - 1)){
            break;
        }
        
        lightningStart = texture2D(coords, vec2(float(i) * (1.0/widthOfCoordsTexture), 0.5) ).xy;
        lightningEnd = texture2D(coords, vec2((float(i)+1.0) * (1.0/widthOfCoordsTexture), 0.5) ).xy;
        
        lightningStart.x *= aspectRatio;
        lightningEnd.x *= aspectRatio;

        testDistance = genLightningAndGetDist(uv, lightningStart, lightningEnd, lineWidthUV, fluctuationUV, 0.3, noise, iGlobalTime, iResolution);
        
        if(testDistance < distanceToPoint){
            distanceToPoint = testDistance;
        }
    }
    
    float invertedDistance = smoothstep(0.0, 220.0, 1.0 / distanceToPoint);
    float multiplier = invertedDistance;
    
    float alpha = 1.0;
    
    if(distanceToPoint <= lineWidthUV){
        finalColor = boltColor;
    }else{
        finalColor = vec3(1.0, 1.0, 0.7);
        alpha *= multiplier;
    }

	gl_FragColor = vec4(finalColor, alpha);
}