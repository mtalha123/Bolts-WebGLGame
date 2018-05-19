//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

//vec2 computeQuadratic(float a, float b, float c){
//    float discriminant, firstAnswer, secondAnswer;
//
//    discriminant = pow(b, 2.0) - (4.0 * a * c);
//
//    if(discriminant < 0.0){
//        return vec2(-1.0);
//    }
//
//    firstAnswer = (-b) + sqrt(discriminant);
//    firstAnswer /= (2.0 * a);
//
//    secondAnswer = (-b) - sqrt(discriminant);
//    secondAnswer /= (2.0 * a);
//
//    return vec2(firstAnswer, secondAnswer);                              
//}
//
//
//float getSlope(vec2 first, vec2 second){
//	if((first.x - second.x) == 0.0){
//    	return -1.0;
//    }
//   
//	return (second.y - first.y) / (second.x - first.x);
//}
//
//float findYIntercept(float slope, vec2 point){
//	return point.y - (slope * point.x);
//}
//
//vec4 getIntersectionPoints(float m, float y_int, vec2 center, float radius){
//    float a = pow(m, 2.0) + 1.0;
//    float b = (2.0 * y_int * m) - (2.0 * center.x) - (2.0 * m * center.y);
//    float c = pow(y_int, 2.0) - (2.0 * y_int * center.y) + pow(center.y, 2.0) + pow(center.x, 2.0) - pow(radius, 2.0);
//	vec2 roots = computeQuadratic(a, b, c);
//    
//    vec2 answerOne = vec2(roots.x, m * roots.x + y_int);
//    vec2 answerTwo = vec2(roots.y, m * roots.y + y_int);
//    
//    return vec4(answerOne, answerTwo);
//}

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
uniform vec2 center;
uniform float radius;
uniform float circleLineWidth;
uniform float circleGlowFactor;
uniform float fluctuation;
uniform float completion;
uniform float lgLineWidth;
uniform float numBolts;
uniform float lgGlowFactor;
uniform float rotationBool;
uniform float spaceInCenterBool;
uniform sampler2D noise;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    
    //normalize
    vec2 centerUV = center.xy / iResolution.xy;
    float radiusUV = radius / iResolution.y;
    float lgLineWidthUV = lgLineWidth / iResolution.y;
    float fluctuationUV = fluctuation / iResolution.y;
    float circleLineWidthUV = circleLineWidth / iResolution.y;
    float circleGlowFactor = circleGlowFactor / iResolution.y;
    float lgGlowFactor = lgGlowFactor / iResolution.y;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    centerUV.x *= aspectRatio;
    
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
        float glowMultiplier = pow(invertedDist * lgGlowFactor, 1.5);
        
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
    float glowMultiplier = pow(invertedDist * circleGlowFactor, 1.3);
    finalColor = smthVal * solidColor + ((1.0 - smthVal) * glowColor * glowMultiplier);
    alpha = glowMultiplier;   

    finalColor += (1.0 - glowMultiplier) * lightningContribution.rgb;
    alpha += lightningContribution.a * (1.0 - glowMultiplier);
     
    
    
	gl_FragColor = vec4(finalColor, alpha);
}