function create_scene(element_id, orbit_controls=false){

	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();

	// Add fog effect
	scene.fog = new THREE.Fog(Colors.fog, 100, 1100);

	// Create camera
	aspect_ratio = WIDTH/HEIGHT;
	field_of_view = 60; // degrees
	near_plane = 1;
	far_plane = 10000;
	camera = new THREE.PerspectiveCamera(
		field_of_view, 
		aspect_ratio, 
		near_plane, 
		far_plane
	);

	camera.position.x = 0;
	camera.position.z = 600;
	camera.position.y = 30;

	renderer = new THREE.WebGLRenderer({
		// Allow transparency to show gradient css background
		alpha:true,

		// Enable anti-aliasing
		antialias: true 
	});

	// Fill entire screen
	renderer.setSize(WIDTH, HEIGHT);

	// Enable shadow rendering
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

	// Attach variable to DOM element
	container = document.getElementById(element_id);
	container.appendChild(renderer.domElement);


	// Change renderer and camera properties upon resize to prevent unwanted scaling effects
	window.addEventListener('resize', function(){
		HEIGHT = window.innerHeight;
		WIDTH = window.innerWidth;
		renderer.setSize(WIDTH, HEIGHT);
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();
	}, false);

	var controls = null;
	if(orbit_controls){
		controls = new THREE.OrbitControls(camera, renderer.domElement);
	}

	camera.lookAt(0, 0, -200);

	var listener = new THREE.AudioListener();
	camera.add( listener );

	
	var audioLoader = new THREE.AudioLoader();

	var engine_loop_sfx = new THREE.Audio(listener);
	var hit_sfx = new THREE.Audio(listener);
	var ding_sfx = new THREE.Audio(listener);

	audioLoader.load( 'sounds/punch.mp3', function( buffer ) {
		hit_sfx.setBuffer( buffer );
		hit_sfx.setVolume(1);
	});	

	audioLoader.load( 'sounds/ding.mp3', function( buffer ) {
		ding_sfx.setBuffer( buffer );
		ding_sfx.setVolume(1);
	});	

	audioLoader.load( 'sounds/engine_loop.ogg', function( buffer ) {
		engine_loop_sfx.setBuffer( buffer );
		engine_loop_sfx.setLoop(true);
		engine_loop_sfx.setVolume(0.2);
	});


	return {
		scene: scene,
		HEIGHT: HEIGHT,
		WIDTH: WIDTH,
		aspect_ratio: aspect_ratio,
		field_of_view: field_of_view,
		near_plane: near_plane,
		far_plane: far_plane,
		camera: camera,
		renderer: renderer,
		container: container,
		controls: controls,
		listener: listener,
		audioLoader: audioLoader,
		sfx: {
			engine_loop_sfx: engine_loop_sfx,
			hit_sfx: hit_sfx,
			ding_sfx: ding_sfx 
			} 
	}

}