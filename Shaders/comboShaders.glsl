//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795

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

float sinPositive(float x){
	return (sin(x) + 1.0) / 2.0;
}

float map(float in_min, float in_max, float out_min, float out_max, float number) {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

uniform vec2 center;
uniform float completion;
uniform vec2 iResolution;
uniform float radius;
uniform float lineWidth;
uniform vec4 firstTextCoords;
uniform vec4 secondTextCoords;
uniform float uniformGap;
uniform sampler2D fontTexture;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = (iResolution.x / iResolution.y);
    vec2 centerUV = center.xy / iResolution.xy;
    float radiusUV = radius / iResolution.y;
    float lineWidthUV = lineWidth / iResolution.y;
    float gap = uniformGap / iResolution.y;
    uv.x *= aspectRatio;
    centerUV.x *= aspectRatio;
    vec4 color = vec4(0.0, 0.0, 1.0, 0.0);
    
    float distToCenter = distance(uv, centerUV);
    float angleOfCompletion = (PI/ 2.0) +  ( (-2.0 * PI) * completion );
    float uvAngle = getUVAngleDeg(uv, centerUV) * (PI / 180.0);
    
    if(uvAngle > (PI / 2.0)){
    	uvAngle -= (2.0 * PI);
    }
    
    
    if(distToCenter > (radiusUV - lineWidthUV) && distToCenter < (radiusUV + lineWidthUV)){
        if(uvAngle <= (PI / 2.0) && uvAngle >= angleOfCompletion){
            //color = vec4(1.0);
        }else{
            float distFromCircOutline = abs(distToCenter - radiusUV);
            float alpha = 1.0 - smoothstep(lineWidthUV - 0.003, lineWidthUV, distFromCircOutline);
        	color = vec4(vec3(0.0, 0.59, 0.79), alpha);
        }
    }
    
    vec2 firstCharStart = vec2( centerUV.x - (radiusUV / 2.0), centerUV.y - (radiusUV / 2.0) );
    vec2 firstCharEnd = vec2( centerUV.x - (radiusUV / 2.0) + 0.04, centerUV.y + (radiusUV / 2.0) );
    
    if(uv.x >= firstCharStart.x && uv.x <= firstCharEnd.x){
        if(uv.y >= firstCharStart.y && uv.y <= firstCharEnd.y){
            float xMapped = map(firstCharStart.x, firstCharEnd.x, firstTextCoords.r, firstTextCoords.b, uv.x);
            float yMapped = map(firstCharStart.y, firstCharEnd.y, firstTextCoords.g, firstTextCoords.a, uv.y);
            vec4 texel = texture2D(fontTexture, vec2(xMapped, yMapped));
            float dist = 1.0 - texel.a;
            float alpha = 1.0 - smoothstep(0.5, 0.6, dist);
            color = vec4(vec3(1.0, 0.0, 0.0), alpha); 
        }
    }
    
    vec2 secondCharStart = vec2( centerUV.x - (radiusUV / 2.0) + 0.04, centerUV.y - (radiusUV / 2.0) );
    vec2 secondCharEnd = vec2( centerUV.x + (radiusUV / 2.0), centerUV.y + (radiusUV / 4.0) );
    
    if(uv.x >= secondCharStart.x && uv.x <= secondCharEnd.x){
        if(uv.y >= secondCharStart.y && uv.y <= secondCharEnd.y){
            float xMapped = map(secondCharStart.x, secondCharEnd.x, secondTextCoords.r, secondTextCoords.b, uv.x);
            float yMapped = map(secondCharStart.y, secondCharEnd.y, secondTextCoords.g, secondTextCoords.a, uv.y);
            vec4 texel = texture2D(fontTexture, vec2(xMapped, yMapped));
            float dist = 1.0 - texel.a;
            float alpha = 1.0 - smoothstep(0.5, 0.6, dist);
            color = vec4(vec3(1.0, 0.0, 0.0), alpha); 
        }
    }
    
	gl_FragColor = color;//vec4(color.rgb, 1.0);
}




/*
#define RADIUS 0.75
#define AB_SCALE 0.75
#define PI 3.1415926535897932384626433832795

vec2 computeQuadratic(float a, float b, float c){
    float discriminant, firstAnswer, secondAnswer;

    discriminant = pow(b, 2.0) - (4.0 * a * c);

    if(discriminant < 0.0){
        return vec2(-1.0);
    }

    firstAnswer = (-b) + sqrt(discriminant);
    firstAnswer /= (2.0 * a);

    secondAnswer = (-b) - sqrt(discriminant);
    secondAnswer /= (2.0 * a);

    return vec2(firstAnswer, secondAnswer);                              
}


float getSlope(vec2 first, vec2 second){
	if((first.x - second.x) == 0.0){
    	return -1.0;
    }
   
	return (second.y - first.y) / (second.x - first.x);
}

float findYIntercept(float slope, vec2 point){
	return point.y - (slope * point.x);
}

vec4 getIntersectionPoints(float m, float y_int, vec2 center, float radius){
    float a = pow(m, 2.0) + 1.0;
    float b = (2.0 * y_int * m) - (2.0 * center.x) - (2.0 * m * center.y);
    float c = pow(y_int, 2.0) - (2.0 * y_int * center.y) + pow(center.y, 2.0) + pow(center.x, 2.0) - pow(radius, 2.0);
	vec2 roots = computeQuadratic(a, b, c);
    
    vec2 answerOne = vec2(roots.x, m * roots.x + y_int);
    vec2 answerTwo = vec2(roots.y, m * roots.y + y_int);
    
    return vec4(answerOne, answerTwo);
}

vec2 rotateCoord(vec2 point, float angle, vec2 center){
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    return ((point - center) * rotationMatrix) + center;
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

float posSin(float val){
	return (sin(val) + 1.0) / 10.0;
}

vec2 resizeVector(vec2 vector, float lengthToResizeTo){
	return vector * (lengthToResizeTo / length(vector));
}

vec2 circleCenter = vec2(0.5, 0.5);

float diskColorr(in vec2 uv)
{
    //float val = smoothstep(0.01,2.0,texture(iChannel0, (uv - vec2((iGlobalTime) /3.6,(iGlobalTime+0.06) /9.2)) + offset).r) * 0.3;
    
    float m = getSlope(uv, vec2(0.5, 0.5));
    float b = findYIntercept(m, vec2(0.5, 0.5));
    vec4 intersectionPoints = getIntersectionPoints(m, b, vec2(0.5, 0.5), 0.2);
    vec2 closestIntersectionPt;
    if(distance(uv, intersectionPoints.rg) < distance(uv, intersectionPoints.ba)){
    	closestIntersectionPt = intersectionPoints.rg;
    }else{
    	closestIntersectionPt = intersectionPoints.ba;
    }
    float val = smoothstep(0.01,2.0,texture(iChannel0,  uv - (iGlobalTime / 5.0)).r) * 0.3;
    float angle = getUVAngleDeg(uv, closestIntersectionPt) * (PI / 180.0); 
    vec2 rotatedPt = rotateCoord(vec2(closestIntersectionPt.x + val, closestIntersectionPt.y), angle, closestIntersectionPt);
    
    float d = distance(uv, rotatedPt);
    return smoothstep(0.05,0.06,d);
}


float anotherApproach(vec2 uv){
    float m = getSlope(uv, vec2(0.5, 0.5));
    float b = findYIntercept(m, vec2(0.5, 0.5));
    vec4 intersectionPoints = getIntersectionPoints(m, b, vec2(0.5, 0.5), 0.2);
    vec2 closestIntersectionPt;
    if(distance(uv, intersectionPoints.rg) < distance(uv, intersectionPoints.ba)){
    	closestIntersectionPt = intersectionPoints.rg;
    }else{
    	closestIntersectionPt = intersectionPoints.ba;
    }
    
    if(b <= (-30.0) || b >= 30.0){
        vec2 first = vec2(uv.x, 0.5 + 0.2);
        vec2 second = vec2(uv.x, 0.5 - 0.2 );
        if(distance(uv, first) < distance(uv, second)){
        	closestIntersectionPt = first;
        }else{
        	closestIntersectionPt = second;
        }
    }

	vec2 uvOffset = (circleCenter - uv);
    vec2 signToUse = sign(uvOffset);
    
    vec2 textCoord = uv + (vec2(iGlobalTime / 6.6, iGlobalTime / 8.2)) * signToUse;
    float val = smoothstep(0.01,2.0,texture(iChannel0, textCoord).r) * 0.2;
    uv = uv + resizeVector(uvOffset, val);
    
    float d = distance(uv, closestIntersectionPt);
    return smoothstep(0.05, 0.06, d);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
	vec2 uv = fragCoord.xy / iResolution.xy;
   	
    vec3 color = vec3(0);
    if(anotherApproach(uv) == 0.0){
    	color = vec3(0.1, 0.5, 1.0);
    }
    
    fragColor = vec4(color, 1.0);
}






*/