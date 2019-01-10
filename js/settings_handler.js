
SETTINGS = {};

$(".dropdown-menu li a").click(function(){
  
  $(".btn-group .btn:first-child p").html($(this).text());
 
});


function update_settings(SCENE){

	console.log("Updating settings");

	// Check antialiasing
	var antialias_value = $('#antialias p').html();

	console.log(antialias_value);

	if(antialias_value == "OFF"){

		console.log("Turning off antialiasing ...");
		SETTINGS.antialias = false;

	}else if(antialias_value == "ON"){

		console.log("Turning on antialiasing ...");
		SETTINGS.antialias = true;

	}else{
		console.log("Error - Unknown antialiasing value detected");
	}

	var old_renderer = SCENE.renderer.domElement;

	// Apply changes
	SCENE.renderer = new THREE.WebGLRenderer({
		antialias: SETTINGS.antialias,
		alpha: true 
	});

	// Fill entire screen
	SCENE.renderer.setSize(WIDTH, HEIGHT);

	// Enable shadow rendering
	SCENE.renderer.shadowMap.enabled = true;
	SCENE.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

	// Attach variable to DOM element
	container = document.getElementById("world");
	container.removeChild(old_renderer);
	container.appendChild(SCENE.renderer.domElement);



	// Close modal
	toggle_menu_modal();

	return SCENE;

}