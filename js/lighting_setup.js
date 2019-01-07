function create_lights(scene){

	// Create hemisphere light
	hemisphere_light = new THREE.HemisphereLight(0xffffff, Colors.blue, 0.1);
	


	ambientLight = new THREE.AmbientLight(0xcc907e, .4);
	

	// Create spotlight
	shadow_light = new THREE.SpotLight(0xffffff, 0.2);
	

	// Set light direction
	shadow_light.position.set(0, 800, 800);
	
	shadow_light.castShadow=true;
	shadow_light.shadowDarkness = 0.5;
	shadow_light.shadow.camera.left = -1000;
	shadow_light.shadow.camera.right = 1000;
	shadow_light.shadow.camera.bottom = -1000;
	shadow_light.shadow.camera.top = 1000;
	shadow_light.shadow.camera.near = 1;
	shadow_light.shadow.camera.far = 2000;
	shadow_light.shadow.mapSize.width = 2048;
	shadow_light.shadow.mapSize.height = 2048;
	shadow_light.shadowCameraVisible = true;

	shadow_light.target.position.set( 0, 50, 100 );

	scene.add(hemisphere_light);
	scene.add(ambientLight);
	scene.add(shadow_light);

	// Shadow light helper
	// var helper = new THREE.SpotLightHelper( shadow_light, 50 );
	// scene.add( helper );

}