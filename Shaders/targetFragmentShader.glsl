precision mediump float;

#define PI 3.1415926535897932384626433832795

//--------------------------------------------------------------------------------------------------------
vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}
//-------------------------------------------------------------------------------------------------------------------


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

float improvedSin(float value){
	return (sin(value) + 1.0) / 2.0;
}

float lightningCos(float value, float lengthOfLightning){
    return (-cos( ((2.0 * PI) / lengthOfLightning) * value) + 1.0) / 2.0;
}

float transformToAspectRatioMeasurement(float aspectRatio, float baseMeasurement, float uvAngle){
    return baseMeasurement + ( cos(abs(uvAngle)) * (aspectRatio - 1.0) * baseMeasurement );
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

float numBolts = 6.0;

const float glowFactor = 14.0;
float fluctuation = 20.0;
float lineWidth = 1.0;

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 center;
uniform float radius;
uniform float circleLineWidth;
uniform float circleGlowFactor;

vec4 generateLightning(vec2 currentUV, vec2 startCoord, vec2 endCoord){
	float aspectRatio = iResolution.x / iResolution.y;
        
    float lightningAmount = 0.025 * iResolution.x;
    float lineWidthUV; 

    vec2 lightningStartUV = startCoord; 
    vec2 lightningEndUV = endCoord; 
    float lengthOfLightning;
    
    float distanceToPoint;
    vec3 colorToReturn = vec3(0.0);
    
    float xClamped, yNoiseVal;
    vec2 pointOnLightning;
        
    if(lightningStartUV.x > lightningEndUV.x){
        float temp = lightningStartUV.x;
        lightningStartUV.x = lightningEndUV.x;
        lightningEndUV.x = temp;
        
        temp = lightningStartUV.y;
        lightningStartUV.y = lightningEndUV.y;
        lightningEndUV.y = temp;
    }

	lengthOfLightning = distance(lightningStartUV, lightningEndUV);

    float angle = asin( (lightningEndUV.y - lightningStartUV.y) / distance(lightningStartUV, lightningEndUV) );
    angle *= (-1.0);
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

    lineWidthUV = transformToAspectRatioMeasurement(aspectRatio, lineWidth / iResolution.y, angle);
    
    fluctuation = fluctuation + (fluctuation *  cos(abs(angle)) * (aspectRatio - 1.0));

    vec2 currentUV_t = (currentUV - lightningStartUV) * rotationMatrix;

    xClamped = clamp(currentUV_t.x, 0.0, lengthOfLightning);
    yNoiseVal = cnoise(vec2(lightningAmount * xClamped, iGlobalTime * 20.)) * ( (fluctuation * lightningCos(xClamped, lengthOfLightning)) / iResolution.x);
    pointOnLightning = vec2(xClamped, clamp(currentUV_t.y, yNoiseVal - lineWidthUV, yNoiseVal + lineWidthUV)); 
    distanceToPoint = distance(currentUV_t, pointOnLightning);

    float invertedDistance = 1.0 / distanceToPoint;
    float multiplier = invertedDistance * (glowFactor / iResolution.x);
    
    if( (currentUV_t.y >= (yNoiseVal - lineWidthUV)) && (currentUV_t.y <= (yNoiseVal + lineWidthUV)) ){
        //colorToReturn = multiplier * vec3(1.0, 1.0, 0.7);
        if( (currentUV_t.x >= 0.0) && (currentUV_t.x <= lengthOfLightning) ){
        	//colorToReturn = vec3(1.0, 1.0, 0.0);
        }
    }else{
        //colorToReturn = multiplier * vec3(1.0, 1.0, 0.7);
    }  
    
    float alpha = 1.0 - smoothstep(lineWidth / iResolution.x, glowFactor / iResolution.x, distanceToPoint);
    colorToReturn = vec3(1.0, 1.0, 0.0);
    colorToReturn *= alpha;
    if(alpha < 1.0){
        colorToReturn = vec3(1.0, 1.0, 0.7);
    }
	return vec4(colorToReturn, alpha);
}

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    uv.x *= aspectRatio;
    
    vec3 finalColor = vec3(0.0);
    vec2 centerUV = vec2( (center.x / iResolution.x) * aspectRatio, center.y / iResolution.y);
    float radiusUV = radius / iResolution.y;
    
    float angleMultipleDeg = 360.0 / numBolts;
    float UVAngleDeg = getUVAngleDeg(uv, centerUV);
    float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
	vec2 rotatedCoord = rotateCoord(vec2(centerUV.x + (radiusUV - ((circleLineWidth / iResolution.x) * 4.0)), centerUV.y), closestAngleMultiple, centerUV);
    
    vec4 lightningContribution = generateLightning(uv, centerUV, rotatedCoord);
    
    float minDist;
    
    float m = getSlope(uv, centerUV);
    float b = findYIntercept(m, uv);
    if(b <= (-30.0) || b >= 30.0){
        vec2 first = vec2(uv.x, centerUV.y + radiusUV );
        vec2 second = vec2(uv.x, centerUV.y - radiusUV );
    	minDist = min(distance(uv, first), distance(uv, second));
    }else{
    	vec4 intersectionPoints = getIntersectionPoints(m, b, centerUV, radiusUV);
    	minDist = min( distance(uv, intersectionPoints.rg), distance(uv, intersectionPoints.ba) );
    }
    
    float alpha = 1.0 - smoothstep(circleLineWidth / iResolution.x, circleGlowFactor / iResolution.x, minDist);

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
	//gl_FragColor = vec4(vec3(1.0), 1.0);
}