console.log('stage 1');

require([
		'../three.js/examples/js/controls/FlyControls.js',
		'../three.js/examples/js/shaders/CopyShader.js',
		'../three.js/examples/js/shaders/FilmShader.js',
		'../three.js/examples/js/postprocessing/EffectComposer.js',
		'../three.js/examples/js/postprocessing/ShaderPass.js',
		'../three.js/examples/js/postprocessing/MaskPass.js',
		'../three.js/examples/js/postprocessing/RenderPass.js',
		'../three.js/examples/js/postprocessing/FilmPass.js',
		'../three.js/examples/js/Detector.js',
		'../three.js/examples/js/libs/stats.min.js',
		'src/earth.js'
	],
	function() {
		console.log(THREE)
	}
);

