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

float getClosestMultiple(int number, int multiple){
    if(number == 0){
    	return 0.0;
    }
	int remainder = int(mod(float(number), float(multiple)));
    
    if(remainder < (multiple / 2)){
    	return float(number - remainder);
    }else{
    	return float(number + (multiple - remainder)); 
    } 
    
}

vec2 rotateCoord(vec2 point, float angle, vec2 center){
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    return ((point - center) * rotationMatrix) + center;
}

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
uniform sampler2D noise;

float numBolts = 6.0;

const float glowFactor = 14.0;
float lineWidth = 1.0;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    
    //normalize
    vec2 centerUV = center.xy / iResolution.xy;
    float radiusUV = radius / iResolution.y;
    float lineWidthUV = lineWidth / iResolution.y;
    float fluctuationUV = fluctuation / iResolution.y;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    centerUV.x *= aspectRatio;
    
    vec3 finalColor = vec3(0.0);
    
    float angleMultipleDeg = 360.0 / numBolts;
    float UVAngleDeg = getUVAngleDeg(uv, centerUV);
    float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
	vec2 rotatedCoord = rotateCoord(vec2(centerUV.x + (radiusUV - ((circleLineWidth / iResolution.x) * 4.0)), centerUV.y), closestAngleMultiple, centerUV);
    
    vec4 lightningContribution = vec4(0.0);
    if(distance(uv, centerUV) <= (completion * radiusUV) ){
        float distToLg = genLightningAndGetDist(uv, centerUV, rotatedCoord, lineWidthUV, fluctuationUV, 4.0, noise, iGlobalTime, iResolution);
        float alpha = 1.0 - smoothstep(lineWidthUV, glowFactor / iResolution.x, distToLg);
        lightningContribution = vec4(1.0, 1.0, 0.0, alpha);
        lightningContribution.rgb *= alpha;
        if(alpha < 1.0){
            lightningContribution = vec4(1.0, 1.0, 0.7, alpha);
        }
    }
    
    float minDist = distance( centerUV + (normalize(uv - centerUV) * radiusUV), uv );
    
    float alpha = 1.0 - smoothstep(circleLineWidth / iResolution.x, circleGlowFactor / iResolution.x, minDist);
        float refAngle = getReferenceAngle(radians(UVAngleDeg));
    if(refAngle > (completion * (PI / 2.0))){
        alpha = 0.0;
    }

    if(alpha >= 1.0){
        finalColor = vec3(0.0, 0.0, 1.0);
    }else if(lightningContribution.a > 0.0){
        finalColor = lightningContribution.rgb;
        alpha = lightningContribution.a;
    }else if(alpha > 0.0){
        finalColor = vec3(0.0, 0.2, 1.0);
    }else{
        finalColor = lightningContribution.rgb + (vec3(0.0, 0.2, 1.0) * alpha);
        alpha += lightningContribution.a;
    }
    
	gl_FragColor = vec4(finalColor, alpha);
}