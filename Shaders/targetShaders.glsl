//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 center;
uniform float radius;
uniform float circleLineWidth;
uniform float circleGlowFactor;
uniform float fluctuation;
uniform float lgLineWidth;
uniform float lgGlowFactor;

varying vec2 centerUV;
varying float radiusUV;
varying float circleLineWidthUV;
varying float circleGlowFactorUV;
varying float fluctuationUV;
varying float lgLineWidthUV;
varying float lgGlowFactorUV;


attribute vec2 vertexPosition;

void main(){
    // FOR FRAGMENT SHADER --------------------------------
    
    //normalize
    centerUV = center.xy / iResolution.xy;
    radiusUV = radius / iResolution.y;
    lgLineWidthUV = lgLineWidth / iResolution.y;
    fluctuationUV = fluctuation / iResolution.y;
    circleLineWidthUV = circleLineWidth / iResolution.y;
    circleGlowFactorUV = circleGlowFactor / iResolution.y;
    lgGlowFactorUV = lgGlowFactor / iResolution.y;
    
    //take aspect ratio into account
    centerUV.x *= aspectRatio;
    
    // ----------------------------------------------------
    
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

float getReferenceAngle(float angleInRadians){
    if(angleInRadians >= ( (3.0 * PI) / 2.0) ){
        return (2.0 * PI) - angleInRadians;
    }
    
    if(angleInRadians >= PI){
        return angleInRadians - PI;
    }
    
    if(angleInRadians >= PI / 2.0){
        return PI - angleInRadians;
    }
    
    return angleInRadians;
}

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform float fluctuation;
uniform float completion;
uniform float numBolts;
uniform float rotationBool;
uniform float spaceInCenterBool;
uniform float capturedBool;
uniform float aspectRatio;
uniform sampler2D noise;

varying vec2 centerUV;
varying float radiusUV;
varying float circleLineWidthUV;
varying float circleGlowFactorUV;
varying float fluctuationUV;
varying float lgLineWidthUV;
varying float lgGlowFactorUV;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= aspectRatio;
    
    if(rotationBool == 1.0){
        uv = rotateCoord(uv, -iGlobalTime * 0.01, centerUV);
    }else{
        // rotating effect
        uv = rotateCoord(uv, iGlobalTime / 15.0, centerUV);
    }
    
    vec3 finalColor = vec3(0.0);
    float alpha = 1.0;
    
    vec4 lightningContribution = vec4(0.0);
    if(distance(uv, centerUV) <= (completion * radiusUV) && numBolts > 0.0){
        /* Dealing with lightning */
        
        float angleMultipleDeg = 360.0 / numBolts;
        float UVAngleDeg = getUVAngleDeg(uv, centerUV);
        float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
        vec2 rotatedCoord = rotateCoord(vec2(centerUV.x + (radiusUV - (circleLineWidthUV)), centerUV.y), closestAngleMultiple, centerUV);
        vec2 lgStartCoord = centerUV;
        if(spaceInCenterBool == 1.0){
            lgStartCoord = rotateCoord(vec2(centerUV.x + (radiusUV * 0.5), centerUV.y), closestAngleMultiple, centerUV);
        }
        
        float distToLg = genLightningAndGetDist(uv, lgStartCoord, rotatedCoord, lgLineWidthUV, fluctuationUV, 4.0, 0.0, noise, iGlobalTime, iResolution);
        distToLg = max(distToLg, 0.0000001);

        vec3 glowColor = vec3(1.0, 1.0, 0.7);
        vec3 solidColor = vec3(1.0, 1.0, 0.0);

        float edgeBlurWidth = min(lgLineWidthUV, 0.005);
        float smthVal = 1.0 - smoothstep(lgLineWidthUV - edgeBlurWidth, lgLineWidthUV, distToLg);  
        float invertedDist = 1.0 / (distToLg - ((1.0 - smthVal) * (lgLineWidthUV - edgeBlurWidth)));
        float glowMultiplier = pow(invertedDist * lgGlowFactorUV, 1.5);
        
        lightningContribution.rgb = (smthVal * solidColor) + ((1.0 - smthVal) * glowColor * glowMultiplier); 
        lightningContribution.a = glowMultiplier;
        
    }
    
    /* Dealing with circle */
    
    vec2 circPt = centerUV + (normalize(uv - centerUV) * radiusUV);
    float distToCircle = distance(circPt, uv);    

    vec3 glowColor = vec3(0.0, 0.3, 1.0);
    vec3 solidColor = vec3(0.0, 0.0, 1.0);

    float edgeBlurWidth = min(circleLineWidthUV, 0.005);
    float smthVal = 1.0 - smoothstep(circleLineWidthUV - edgeBlurWidth, circleLineWidthUV, distToCircle);  
    float invertedDist = 1.0 / (distToCircle - ((1.0 - smthVal) * (circleLineWidthUV - edgeBlurWidth)));
    float glowMultiplier = pow(invertedDist * circleGlowFactorUV, 1.3);
    finalColor = smthVal * solidColor + ((1.0 - smthVal) * glowColor * glowMultiplier);
    alpha = glowMultiplier;   

    finalColor += (1.0 - glowMultiplier) * lightningContribution.rgb;
    alpha += lightningContribution.a * (1.0 - glowMultiplier);
     
    if(capturedBool == 1.0){
        finalColor.r = 1.0;
        alpha = pow(alpha, 1.6);
    }
    
    
	gl_FragColor = vec4(finalColor, alpha);
}