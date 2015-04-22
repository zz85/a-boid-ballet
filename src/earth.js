if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// TODO: add specular, add flare.

var atmosphere, c, camera, diffuse, diffuseNight, f, fragmentGround, fragmentSky, g, ground, maxAnisotropy, radius, render, renderer, scene, sky, uniforms, vertexSky;


function onResize() {
	camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
}

function init() {
	scene = new THREE.Scene();

	onResize();

	renderer = new THREE.WebGLRenderer();

	renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.setClearColorHex(0x000000, 1);

	document.body.appendChild(renderer.domElement);


	window.addEventListener('resize', onResize);

	renderer.setSize(window.innerWidth, window.innerHeight);

	vertexSky = document.getElementById('vertexSky').innerText;

	fragmentSky = document.getElementById('fragmentSky').innerText;

	vertexGround = document.getElementById('vertexGround').innerText;

	fragmentGround = document.getElementById('fragmentGround').innerText;

	radius = 100.0;


	/*
	atmosphere =
		Kr				: 0.0025
		Km				: 0.0010
		ESun			: 15.0
		g				: -0.990
		innerRadius 	: radius
		outerRadius		: radius * 1.05
		wavelength		: [0.650, 0.570, 0.475]
		scaleDepth		: 0.25
		mieScaleDepth	:	0.1
	 */

	atmosphere = {
		Kr: 0.0025,
		Km: 0.0010,
		ESun: 20.0,
		g: -0.950,
		innerRadius: 100,
		outerRadius: 102.5,
		wavelength: [0.650, 0.570, 0.475],
		scaleDepth: 0.25,
		mieScaleDepth: 0.1
	};

	diffuse = THREE.ImageUtils.loadTexture('textures/earth_atmos_2048.jpg');
	diffuseNight = THREE.ImageUtils.loadTexture('textures/earth_lights_lrg.jpg');
	// diffuseNight = diffuse;

	// /map-lights.jpg

	maxAnisotropy = renderer.getMaxAnisotropy();

	diffuse.anisotropy = maxAnisotropy;

	diffuseNight.anisotropy = maxAnisotropy;

	uniforms = {
		v3LightPosition: {
			type: "v3",
			value: new THREE.Vector3(1e8, 0, 1e8).normalize()
		},
		v3InvWavelength: {
			type: "v3",
			value: new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
		},
		fCameraHeight: {
			type: "f",
			value: 0
		},
		fCameraHeight2: {
			type: "f",
			value: 0
		},
		fInnerRadius: {
			type: "f",
			value: atmosphere.innerRadius
		},
		fInnerRadius2: {
			type: "f",
			value: atmosphere.innerRadius * atmosphere.innerRadius
		},
		fOuterRadius: {
			type: "f",
			value: atmosphere.outerRadius
		},
		fOuterRadius2: {
			type: "f",
			value: atmosphere.outerRadius * atmosphere.outerRadius
		},
		fKrESun: {
			type: "f",
			value: atmosphere.Kr * atmosphere.ESun
		},
		fKmESun: {
			type: "f",
			value: atmosphere.Km * atmosphere.ESun
		},
		fKr4PI: {
			type: "f",
			value: atmosphere.Kr * 4.0 * Math.PI
		},
		fKm4PI: {
			type: "f",
			value: atmosphere.Km * 4.0 * Math.PI
		},
		fScale: {
			type: "f",
			value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
		},
		fScaleDepth: {
			type: "f",
			value: atmosphere.scaleDepth
		},
		fScaleOverScaleDepth: {
			type: "f",
			value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
		},
		g: {
			type: "f",
			value: atmosphere.g
		},
		g2: {
			type: "f",
			value: atmosphere.g * atmosphere.g
		},
		nSamples: {
			type: "i",
			value: 3
		},
		fSamples: {
			type: "f",
			value: 3.0
		},
		tDiffuse: {
			type: "t",
			value: diffuse
		},
		tDiffuseNight: {
			type: "t",
			value: diffuseNight
		},
		tDisplacement: {
			type: "t",
			value: 0
		},
		tSkyboxDiffuse: {
			type: "t",
			value: 0
		},
		fNightScale: {
			type: "f",
			value: 1
		}
	};

	ground = {
		geometry: new THREE.SphereGeometry(atmosphere.innerRadius, 50, 50),
		material: new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: vertexGround,
			fragmentShader: fragmentGround
		})
	};

	ground.mesh = new THREE.Mesh(ground.geometry, ground.material);

	scene.add(ground.mesh);

	sky = {
		geometry: new THREE.SphereGeometry(atmosphere.outerRadius, 500, 500),
		material: new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: vertexSky,
			fragmentShader: fragmentSky
		})
	};

	sky.mesh = new THREE.Mesh(sky.geometry, sky.material);

	sky.material.side = THREE.BackSide;

	sky.material.transparent = true;

	scene.add(sky.mesh);

	c = null;

	f = 0;

	g = 0;

	light = new THREE.Vector3();
	eye = new THREE.Vector3();
	cameraTarget = new THREE.Vector3(0, 0, 0)


	controls = new THREE.FlyControls( camera );

	controls.movementSpeed = 1000;
	controls.domElement = renderer.domElement;
	controls.rollSpeed = Math.PI / 24;
	controls.autoForward = false;
	controls.dragToLook = false;

	clock = new THREE.Clock();

}


var cameraHeight, euler, eye, light, matrix, vector, cameraTarget, clock;


function render() {
	
	
	requestAnimationFrame(render);
	f += 0.0002;
	g += 0.008;


	// var delta = clock.getDelta();
	// controls.movementSpeed = 0.33 ; // d
	// controls.update( delta );

	eye.set(radius * 0.9 + Math.sin(Date.now() * 0.001 * 0.1) * 50 , 0 , 0);
	
	euler = new THREE.Euler(g / 60 + 12, -f * 10 + 20, 0);

	matrix = new THREE.Matrix4().makeRotationFromEuler(euler);
	
	eye = eye.applyMatrix4(matrix);
 

	camera.position.copy(eye);
	camera.lookAt(cameraTarget);
	
	light.set(1, 0, 0);
	vector = new THREE.Vector3(1, 0, 0);

	euler = new THREE.Euler(f, g, 0);
	matrix = new THREE.Matrix4().makeRotationFromEuler(euler);

	light = light.applyMatrix4( matrix );

	cameraHeight = camera.position.length();
	sky.material.uniforms.v3LightPosition.value = light;
	sky.material.uniforms.fCameraHeight.value = cameraHeight;
	sky.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;
	ground.material.uniforms.v3LightPosition.value = light;
	ground.material.uniforms.fCameraHeight.value = cameraHeight;
	ground.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;
	
	renderer.render(scene, camera);
}

init();
render();