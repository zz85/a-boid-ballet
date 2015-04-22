console.log('loading boid ballet');

require([
		'lib/three.js',
		'../timeliner/timeliner.js',
	],
	function() {
		require(['src/stage1.js'])
	}
);

