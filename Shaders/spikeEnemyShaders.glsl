//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795
#define RIGHT_ANGLE PI / 2.0

//returns angle between 0 and 2.0 * PI
float getUVAngle(vec2 uv, vec2 center){
    return radians(getUVAngleDeg(uv, center));
}

float getQuadrantNum(vec2 uv, vec2 center, float radius){
	float uvAngle = getUVAngle(uv, center);
    if(uvAngle <= RIGHT_ANGLE){
    	return 1.0;
    }
    
    if(uvAngle > RIGHT_ANGLE && uvAngle <= PI){
    	return 2.0;
    }
    
    if(uvAngle > PI && uvAngle <= (3.0 * PI / 2.0)){
    	return 3.0;
    }
    
    if(uvAngle > (3.0 * PI / 2.0)){
    	return 4.0;
    }
}

vec4 getSpikeColor(vec2 uv, vec2 start, float angle, float radius){
    uv.y += radius * 4.0;
    float uvAngle = getUVAngle(uv, start);    
    vec2 pointOnSpike = vec2(radius * 4.0 * cos(uvAngle), radius * 4.0 * sin(uvAngle));
    pointOnSpike += vec2(start.x, start.y);
    float dist = distance(uv, pointOnSpike);
    
    float lineWidth = 0.05; 
    vec4 color = vec4(0.0);
    if( (uvAngle <= RIGHT_ANGLE) && (dist <= lineWidth) ){
        float m = (1.0 / dist) * 0.005;
    	return vec4( m * vec3(1.0, 0.0, 0.0), m );
    }
    
    return color;
}

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 center;
uniform float radius;
uniform float numBolts;
uniform sampler2D noise;


void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
   	vec4 color = vec4(1.0);
    
    //normalize
    vec2 center = center.xy / iResolution.xy;
    float radius = radius / iResolution.y;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    center.x *= aspectRatio;
    
    uv = rotateCoord(uv, -0.01 * iGlobalTime, center);
    float quadrantNum = getQuadrantNum(uv, center, radius);
    float angleToReverseRotate = (quadrantNum - 1.0) * RIGHT_ANGLE;
    vec2 uv_t = rotateCoord(uv, -angleToReverseRotate, center);
    
    vec2 closestPtToCircle = normalize(uv_t - center) * radius;
    uv_t -= closestPtToCircle;
    color = getSpikeColor(uv_t, center, PI/2.0, radius);
    
    
    /* Dealing with lg bolts */
    if(numBolts > 0.0){
        uv = rotateCoord(uv, -0.04 * iGlobalTime * numBolts, center); // make lg spin faster, relative to how many bolts there are   
        vec4 lgContribution;
        float angleMultipleDeg = 360.0 / numBolts;
        float UVAngleDeg = getUVAngleDeg(uv, center);
        float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
        vec2 rotatedCoord = rotateCoord(vec2(center.x + radius, center.y), closestAngleMultiple, center);
        vec2 lgStartCoord = center;
    
        float distToLg = genLightningAndGetDist(uv, lgStartCoord, rotatedCoord, 0.001, 0.002, 4.0, 0.0, noise, iGlobalTime, iResolution);
        if(distToLg == 0.0){
            distToLg = 0.0000001;
        }
        
        vec3 lgColor = vec3(1.0, 1.0, 0.7);
        float glowMult = 0.003;

        lgContribution.rgb = (1.0 / distToLg) * glowMult * lgColor;
        lgContribution.a = pow((1.0 / distToLg) * glowMult, 1.5);

        color += lgContribution;
    }
    
    gl_FragColor = color;
}