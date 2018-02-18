WWVertexShader = `
	uniform float time;
	uniform vec2 resolution;
	uniform vec2 mouse;
	varying vec2 vUv; 
	void main() {
		vUv = uv;
		vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
		gl_Position = projectionMatrix * mvPosition;
	}`;


WWFragmentShader = `
		 
		uniform float time;
		uniform vec2 resolution;
		uniform sampler2D iChannel0;
		uniform vec2 mouse;

		varying vec2 vUv;

		#define TEX_REPEAT_X 4.
		#define TEX_REPEAT_Y 1.

		#define TEX_WIDTH 1.
		#define PI 3.1415926535897932384626433832795;

		#define time2 time*0.05
		#define tau 6.2831853

		vec2 frustum = vec2(resolution.x / resolution.y, 1.) / resolution.xy;

	

		 float dist(vec2 p0, vec2 pf){return sqrt((pf.x-p0.x)*(pf.x-p0.x)+(pf.y-p0.y)*(pf.y-p0.y));}


		 float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed)
		{
		  vec2 sourceToCoord = coord - raySource;
		  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
		  
		  return clamp(
		    (0.45 + 0.15 * sin(cosAngle * seedA + time * speed)) +
		    (0.3 + 0.2 * cos(-cosAngle * seedB + time * speed)),
		    0.0, 1.0) *
		    clamp((resolution.x - length(sourceToCoord)) / resolution.x, 0.05 + (resolution.y/resolution.x)*.1, 1.0);
		}

		float noise(float t)
		{
		  return texture2D(iChannel0,vec2(t, 0.0) / vec2(resolution.x,resolution.y)).x;
		}
		float noise(vec2 t)
		{
		  return texture2D(iChannel0,(t + vec2(time)) / vec2(resolution.x,resolution.y) ).x;
		}

		

		vec3 cc(vec3 color, float factor,float factor2) // color modifier
		{
		  float w = color.x+color.y+color.z;
		  return mix(color,vec3(w)*factor,w*factor2);
		}



		mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
		float noise2( in vec2 x ){return texture2D(iChannel0, x*.01).x;}
		mat2 m2 = mat2( .80,  0.60, -0.80,  0.80 );

		float grid(vec2 p)
		{
		  float s = sin(p.x)*cos(p.y);
		  return s;
		}

		float flow2(in vec2 p)
		{
		  float z=4.;
		  float rz = 0.;
		  vec2 bp = p;
		  for (float i= 1.;i < 7.;i++ )
		  {
		    bp += time2*1.5;
		    vec2 gr = vec2(grid(p*3.-time2*2.),grid(p*3.+4.-time2*2.))*0.4;
		    gr = normalize(gr)*0.4;
		    gr *= makem2((p.x+p.y)*.3+time2*10.);
		    p += gr*0.5;
		    
		    rz-= (sin(noise2(p)*2.)*0.5+0.5) /z;
		    
		    p = mix(bp,p,.5);
		    z *= 1.7;
		    p *= 2.5;
		    p*=m2;
		    bp *= 2.5;
		    bp*=m2;
		  }
		  return rz;  
		}

		float spiral(vec2 p,float scl) 
		{
		  float r = length(p);
		  r = log(r);
		  float a = atan(p.y, p.y);
		  return abs(mod(scl*(r-2./scl*a),tau)-1.)*2.;
		}




		void main() {
		    vec2 uv = -1.0 + 2.0 *vUv;
		    //vec2 uv= fract(vUv);
		    //vec2 uv =gl_FragCoord.xy / resolution.xy;
		    uv.y = 1.0 - uv.y;
		    vec2 coord = vec2(gl_FragCoord.x, resolution.y -gl_FragCoord.y);
		  
			// Set the parameters of the sun rays
			vec2 rayPos1 = vec2(resolution.x * 1.1, resolution.y * -0.4);
			vec2 rayRefDir1 = normalize(vec2(1.0, -0.116));
			float raySeedA1 = 36.2214;
			float raySeedB1 = 21.11349;
			float raySpeed1 = 1.5;

			vec2 rayPos2 = vec2(resolution.x * 1.2, resolution.y * -0.6);
			vec2 rayRefDir2 = normalize(vec2(1.0, 0.241));
			float raySeedA2 = 22.39910;
			float raySeedB2 = 18.0234;
			float raySpeed2 = 1.1;
		  
		  // Calculate the colour of the sun rays on the current fragment
		  vec4 rays1 =
		    vec4(.2, .5, 1.0, 1.0) *
		    rayStrength(rayPos1, rayRefDir1, coord, raySeedA1, raySeedB1, raySpeed1);
		   
		  vec4 rays2 =
		    vec4(.2, .5, 1.0, 1.0) *
		    rayStrength(rayPos2, rayRefDir2, coord, raySeedA2, raySeedB2, raySpeed2);
		  
		  vec4 col = rays1 * 0.6 + rays2 * 0.5;

		  gl_FragColor=col*1.0;

		  float brightness = .5 - ((coord.y / resolution.y) );
		  gl_FragColor.x *= .8 + (brightness * 0.3);
		  gl_FragColor.y *= .8 + (brightness * 0.3);
		  gl_FragColor.z *= .8 + (brightness * 0.5);

		  vec2 p2 = gl_FragCoord.xy / resolution.xy-0.5;
		  //p2.x *= resolution.x/resolution.y;
		  //p2.y *= resolution.y/resolution.x;
		  p2*= 1.1;
		  p2.y+=.6;
		  p2.x+=1.1;
		  float rz = flow2(p2);
		  p2 /= exp(mod(1.1,1.1));
		  rz *= (5.0-spiral(p2,.8))*.09; // intensity / thickness of ring
		  vec3 colb = vec3(.09,0.02,0.01)/rz; // colors
		  colb=pow(abs(colb),vec3(2.51));
		  gl_FragColor += (vec4(colb,.1) *.25);

		  //gl_FragColor += vec4(sparks,.3);

		 
		  }`;
