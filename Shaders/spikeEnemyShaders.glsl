//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 center;
uniform float radius;

varying vec2 centerUV;
varying float radiusUV;


attribute vec2 vertexPosition;

void main(){
    // FOR FRAGMENT SHADER --------------------------------
    
    //normalize
    centerUV = center.xy / iResolution.xy;
    radiusUV = radius / iResolution.y;
    
    //take aspect ratio into account
    centerUV.x *= aspectRatio;
    
    // ----------------------------------------------------    
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

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
uniform float aspectRatio;
uniform float iGlobalTime;
uniform float numBolts;
uniform sampler2D noise;

varying vec2 centerUV;
varying float radiusUV;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= aspectRatio;
    vec4 color = vec4(1.0);
    
    uv = rotateCoord(uv, -0.01 * iGlobalTime, centerUV);
    float quadrantNum = getQuadrantNum(uv, centerUV);
    float angleToReverseRotate = (quadrantNum - 1.0) * RIGHT_ANGLE;
    vec2 uv_t = rotateCoord(uv, -angleToReverseRotate, centerUV);
    
    vec2 closestPtToCircle = normalize(uv_t - centerUV) * radiusUV;
    uv_t -= closestPtToCircle;
    color = getSpikeColor(uv_t, centerUV, PI/2.0, radiusUV);
    
    
    /* Dealing with lg bolts */
    if(numBolts > 0.0){
        uv = rotateCoord(uv, -0.04 * iGlobalTime * numBolts, centerUV); // make lg spin faster, relative to how many bolts there are   
        vec4 lgContribution;
        float angleMultipleDeg = 360.0 / numBolts;
        float UVAngleDeg = getUVAngleDeg(uv, centerUV);
        float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
        vec2 rotatedCoord = rotateCoord(vec2(centerUV.x + radiusUV, centerUV.y), closestAngleMultiple, centerUV);
        vec2 lgStartCoord = centerUV;
    
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