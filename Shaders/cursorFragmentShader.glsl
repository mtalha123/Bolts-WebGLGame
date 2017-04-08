precision mediump float;

uniform vec2 iResolution;
uniform float clicked;
uniform vec2 mouseCoords;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    uv.x *= aspectRatio;
    
    vec2 mousecoords = mouseCoords / iResolution.xy;
    mousecoords.x *= aspectRatio;
    vec3 finalColor = vec3(0.4, 0.4, 0.4);
    float alpha = 0.0;
    
    if(distance(uv, mousecoords) < 0.02){
        alpha = 1.0;
        if(clicked == 1.0){
            finalColor = vec3(0.2, 0.2, 0.2);
        }
    }
    
	gl_FragColor = vec4(finalColor, alpha);
}