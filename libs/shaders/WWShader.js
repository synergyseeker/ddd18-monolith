WWVertexShader = 
	"uniform float time;\n" +
	"uniform vec2 resolution;\n" +
	"uniform vec2 mouse;\n" +
	"varying vec2 vUv; \n" +
	"void main() {\n" +
		"vUv = uv;\n" +
		"vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );\n" +
		"gl_Position = projectionMatrix * mvPosition;\n" +
	"}";


WWFragmentShader = 
		 
		"uniform float time;\n" +
		"uniform vec2 resolution;\n" +
		"uniform sampler2D iChannel0;\n" +
		"uniform vec2 mouse;\n" +

		"varying vec2 vUv;\n" +

		"#define TEX_REPEAT_X 4.\n" +
		"#define TEX_REPEAT_Y 1.\n" +

		"#define TEX_WIDTH 1.\n" +
		"#define PI 3.1415926535897932384626433832795;\n" +

		"#define time2 time*0.05\n" +
		"#define tau 6.2831853\n" +

		"vec2 frustum = vec2(resolution.x / resolution.y, 1.) / resolution.xy;\n" +

	

		 "float dist(vec2 p0, vec2 pf){return sqrt((pf.x-p0.x)*(pf.x-p0.x)+(pf.y-p0.y)*(pf.y-p0.y));}\n" +


		 "float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed)\n" +
		"{\n" +
		  "vec2 sourceToCoord = coord - raySource;\n" +
		  "float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);\n" +
		  
		  "return clamp(\n" +
		    "(0.45 + 0.15 * sin(cosAngle * seedA + time * speed)) +\n" +
		   " (0.3 + 0.2 * cos(-cosAngle * seedB + time * speed)),\n" +
		  "  0.0, 1.0) *\n" +
		 "   clamp((resolution.x - length(sourceToCoord)) / resolution.x, 0.05 + (resolution.y/resolution.x)*.1, 1.0);\n" +
		"}\n" +

		"float noise(float t)\n" +
		"{\n" +
		"  return texture2D(iChannel0,vec2(t, 0.0) / vec2(resolution.x,resolution.y)).x;\n" +
		"}\n" +
		"float noise(vec2 t)\n" +
		"{\n" +
		 " return texture2D(iChannel0,(t + vec2(time)) / vec2(resolution.x,resolution.y) ).x;\n" +
		"}\n" +

		

		"vec3 cc(vec3 color, float factor,float factor2)\n" +
		"{\n" +
		  "float w = color.x+color.y+color.z;\n" +
		  "return mix(color,vec3(w)*factor,w*factor2);\n" +
		"}\n" +



		"mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}\n" +
		"float noise2( in vec2 x ){return texture2D(iChannel0, x*.01).x;}\n" +
		"mat2 m2 = mat2( .80,  0.60, -0.80,  0.80 );\n" +

		"float grid(vec2 p)\n" +
		"{\n" +
		  "float s = sin(p.x)*cos(p.y);\n" +
		  "return s;\n" +
		"}\n" +

		"float flow2(in vec2 p)\n" +
		"{\n" +
		  "float z=4.;\n" +
		  "float rz = 0.;\n" +
		  "vec2 bp = p;\n" +
		  "for (float i= 1.;i < 7.;i++ )\n" +
		  "{\n" +
		    "bp += time2*1.5;\n" +
		    "vec2 gr = vec2(grid(p*3.-time2*2.),grid(p*3.+4.-time2*2.))*0.4;\n" +
		    "gr = normalize(gr)*0.4;\n" +
		    "gr *= makem2((p.x+p.y)*.3+time2*10.);\n" +
		    "p += gr*0.5;\n" +
		    
		    "rz-= (sin(noise2(p)*2.)*0.5+0.5) /z;\n" +
		    
		    "p = mix(bp,p,.5);\n" +
		    "z *= 1.7;\n" +
		    "p *= 2.5;\n" +
		    "p*=m2;\n" +
		    "bp *= 2.5;\n" +
		    "bp*=m2;\n" +
		  "}\n" +
		  "return rz;  \n" +
		"}\n" +

		"float spiral(vec2 p,float scl) \n" +
		"{\n" +
		  "float r = length(p);\n" +
		  "r = log(r);\n" +
		  "float a = atan(p.y, p.y);\n" +
		  "return abs(mod(scl*(r-2./scl*a),tau)-1.)*2.;\n" +
		"}\n" +




		"void main() {\n" +
		    "vec2 uv = -1.0 + 2.0 *vUv;\n" +
		    //vec2 uv= fract(vUv);
		    //vec2 uv =gl_FragCoord.xy / resolution.xy;
		    "uv.y = 1.0 - uv.y;\n" +
		    "vec2 coord = vec2(gl_FragCoord.x, resolution.y -gl_FragCoord.y);\n" +
		  
			// Set the parameters of the sun rays
			"vec2 rayPos1 = vec2(resolution.x * 1.1, resolution.y * -0.4);\n" +
			"vec2 rayRefDir1 = normalize(vec2(1.0, -0.116));\n" +
			"float raySeedA1 = 36.2214;\n" +
			"float raySeedB1 = 21.11349;\n" +
			"float raySpeed1 = 1.5;\n" +

			"vec2 rayPos2 = vec2(resolution.x * 1.2, resolution.y * -0.6);\n" +
			"vec2 rayRefDir2 = normalize(vec2(1.0, 0.241));\n" +
			"float raySeedA2 = 22.39910;\n" +
			"float raySeedB2 = 18.0234;\n" +
			"float raySpeed2 = 1.1;\n" +
		  
		  // Calculate the colour of the sun rays on the current fragment
		  "vec4 rays1 =\n" +
		    "vec4(.2, .5, 1.0, 1.0) *\n" +
		    "rayStrength(rayPos1, rayRefDir1, coord, raySeedA1, raySeedB1, raySpeed1);\n" +
		   
		  "vec4 rays2 =\n" +
		    " vec4(.2, .5, 1.0, 1.0) *\n" +
		   " rayStrength(rayPos2, rayRefDir2, coord, raySeedA2, raySeedB2, raySpeed2);\n" +
		  
		  "vec4 col = rays1 * 0.6 + rays2 * 0.5;\n" +

		  "gl_FragColor=col*1.0;\n" +

		  "float brightness = .5 - ((coord.y / resolution.y) );\n" +
		  "gl_FragColor.x *= .8 + (brightness * 0.3);\n" +
		  "gl_FragColor.y *= .8 + (brightness * 0.3);\n" +
		  "gl_FragColor.z *= .8 + (brightness * 0.5);\n" +

		  "vec2 p2 = gl_FragCoord.xy / resolution.xy-0.5;\n" +
		  //p2.x *= resolution.x/resolution.y;
		  //p2.y *= resolution.y/resolution.x;
		  "p2*= 1.1;\n" +
		  "p2.y+=.6;\n" +
		  "p2.x+=1.1;\n" +
		  "float rz = flow2(p2);\n" +
		  "p2 /= exp(mod(1.1,1.1));\n" +
		  "rz *= (5.0-spiral(p2,.8))*.09; \n" +
		  "vec3 colb = vec3(.09,0.02,0.01)/rz; \n" +
		  "colb=pow(abs(colb),vec3(2.51));\n" +
		  "gl_FragColor += (vec4(colb,.1) *.25);\n" +

		  //gl_FragColor += vec4(sparks,.3);

		 
		  "}";
