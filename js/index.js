// Entry point
// 
// 
window.addEventListener('load', init, false);

// Global variables
var SCENE;

var road, sky;
var mouse = {x:0, y:0};
var context;

var world_angle=60, 
 	world_radius=600;

var GAME = {};


function init(){

	GAME = initialize_game();

	// Initialize audio
	context = new AudioContext();

	// set up SCENE.scene, camera, SCENE.renderer
	SCENE = create_scene('world', false);

	// set up lighting
	create_lights(SCENE.scene);

	// add objects
	create_character(0);
	create_environment();

	// Input handler
	document.addEventListener('mousemove', input_handler, false);
	document.addEventListener('touchmove', touch_input_handler, false);

	// Start menu handler
	document.getElementById('play-button').addEventListener('click', ()=>{

		// Resume audio context
		context.resume().then(() => {console.log("Audio context resumed.")});

		// Hide play button
		document.getElementById('play-button').style.display = 'none';

		// Start game levels
		start_game(GAME, car, road);

	});

	// Initialize menu
	update_health_display();
	update_level_display();
	update_score_display();
	update_distance_display();


	$("#save").click(function(){
		SCENE = update_settings(SCENE);
	});

	// start game loop
	game_loop();
	
}




function create_character(){

	car = new Car();

	// Add car lights to SCENE.scene
	for(var i = 0; i < car.lights.length; i++){
		SCENE.scene.add(car.lights[i]);
	}

	var car_scale = 1;
	var curve_offset = 1;

	car.mesh.scale.set(car_scale, car_scale, car_scale);
	
	// Calculate position depending on world_angle using trigonometry
	car.mesh.position.z = Math.cos(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset);
	car.mesh.position.y = Math.sin(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset) - 600;

	var slope = -(car.mesh.position.y + 600)/car.mesh.position.z;
	car.mesh.rotation.x = Math.atan(slope) + Math.PI/2;
	car.mesh.castShadow=true;
	car.mesh.receiveShadow = true;

	SCENE.scene.add(car.mesh);

}



function create_environment(world_radius=600, world_width=400){

	road = new Road(false, world_radius, world_width);
	road.mesh.position.y = -world_radius;
	road.mesh.receiveShadow = true;
	SCENE.scene.add(road.mesh);


	sky = new Sky(60, 1000, 800, 50);
	sky.mesh.position.y = -world_radius;
	SCENE.scene.add(sky.mesh);

}



function game_loop(){

	requestAnimationFrame(game_loop);
	
	// Add correct codition
	if(!GAME.paused){

		road.update();

		sky.mesh.rotation.x += 0.003;

	}	

	if(GAME.started && !GAME.paused) {

		GAME.distance++;
		
		check_collision(car.mesh.children[0]);

		// ARCHITECTURE: Combine these in a smart way (minimizing coupling) (1)
		car.update();
		car_movement();

		update_distance_display();

	}


	if(!GAME.ended && GAME.health <= 0 && !GAME.paused){
		end_game();
	}

	SCENE.renderer.render(SCENE.scene, camera);

}

function input_handler(event){

	// Change input  collection from scene_width to center +- scene_width/2
	var movement_speed = 0.3;
	var x = ((event.clientX/SCENE.WIDTH)*2 - 1)/movement_speed; // value between -1 and 1
	var y = (event.clientY/SCENE.HEIGHT)*2 - 1;// value between -1 and 1

	mouse = {x:x, y:y};

}

function touch_input_handler(event) {

	var movement_speed = 0.3;
    // event.preventDefault();
    
    var tx = (-1 + (event.touches[0].pageX / SCENE.WIDTH)*2)/movement_speed;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;

    mouse = {x:tx, y:ty};
}


function car_movement(){

	var speed = 0.03;

	var target_x = map(Math.min(Math.max(mouse.x, -1), 1), -1, 1, -150, 150);
	var target_y = map(mouse.y, -1, 1, 25, 175);

	var error = target_x - car.mesh.position.x;

	car.mesh.position.x += error*speed;

	var slope = -(car.mesh.position.y + 600)/car.mesh.position.z;

	var target_angle = Math.atan(slope) + Math.PI/2;
	car.mesh.rotation.x -= 0.1*(car.mesh.rotation.x - target_angle);


	car.mesh.position.z -= 0.04*(car.mesh.position.z - Math.cos(deg2rad(world_angle))*(world_radius + car.ground_offset - 1));
	car.mesh.position.y -= 0.04*(car.mesh.position.y - Math.sin(deg2rad(world_angle))*(world_radius + car.ground_offset - 1) + 600);


	car.wheel_mesh_array[2].rotation.y = -error*error*error*0.0000003 + Math.PI;
	car.wheel_mesh_array[3].rotation.y = -error*error*error*0.0000003;
	
	car.set_angle(-(target_x - car.mesh.position.x)*0.002);
	
}

function make_transparent(object, opacity){
	object.material.transparent = true;
	if(object.material.opacity != 0) object.material.opacity = opacity;
}



// ARCHITECTURE: Refactor collision system into neater implementation
function check_collision(Player){

	// TODO: (2) Improve collision system such as to have custom collision effects.
	//  depending on which side of the car the collision occured

	// var Player = SCENE.scene.getObjectByName('car');
	var originPoint = car.mesh.position.clone();
	for (var vertexIndex = 0; vertexIndex < Player.geometry.vertices.length; vertexIndex++){       
	    
	    var localVertex = Player.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(Player.matrix);
        var directionVector = globalVertex.sub(Player.position);
        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());

        // Check obstacle collision
	    for(var tree_index = 1; tree_index < road.obstacles.length; tree_index++){

	    	// For performance increase, check less collisions, only imminent
	    	// This can be further reduced to a smaller window
	    	if(road.obstacles[tree_index].global_y < car.mesh.position.y - 20) continue;

	    	var collision_results = ray.intersectObject(road.obstacles[tree_index].tree.collision_box);
	    	if (collision_results.length > 0 && collision_results[0].distance < directionVector.length()) {

            	if(!road.obstacles[tree_index].hit){
	            
            		c = SCENE.sfx.hit_sfx.cloneNode();
            		c.play();

            		car.mesh.rotation.x += Math.PI/14; 
            		car.mesh.position.z += 60;
            		car.mesh.position.y -= 20;

	            	road.obstacles[tree_index].hit = true;
	            	var obj = road.obstacles[tree_index].tree.mesh;
					for(var j = 0; j < obj.children.length; j++){
						make_transparent(obj.children[j], 0.4);
					}	        	

					GAME.health -= 10;

					if(GAME.score < 0 ) {

						GAME.score = 0;
					}
					update_health_display();
					update_score_display();

				}
	        }
	    }

	    // Check collectable collision
	    for(var collectable_index = 0; collectable_index < road.collectables.length; collectable_index++){

	    	// Obstacles and collectables have same y and z values
	    	if(road.collectables[collectable_index].empty) continue;
	    	if(road.obstacles[collectable_index].global_y < car.mesh.position.y - 20) continue;

	    	var collision_results = ray.intersectObject(road.collectables[collectable_index].collectable.collision_box);
	    	
	    	if (collision_results.length > 0 && collision_results[0].distance < directionVector.length()) {

            	if(!road.collectables[collectable_index].hit){
	            	
            		c = SCENE.sfx.ding_sfx.cloneNode();
            		c.play();

            		GAME.score += 10;
            		
            		// Level up
            		if(GAME.score > 100) {

            			GAME.score = 0;
            			GAME.level++;

            			GAME = increase_difficulty(GAME);
            			update_level_display();


            			// DESIGN: (3) Check the balance of this feature
            			// if(GAME.level % 10 == 0){
            			// 	GAME.health = 100;
            			// }
            			// update_health_display();

            		}

            		// Update onscreen score
            		update_score_display();

	            	road.collectables[collectable_index].hit = true;
	            	var obj = road.collectables[collectable_index].collectable.mesh;

	            	// Delete object upon collision
					road.mesh.remove(obj);

					// TODO: (2) Add particle effect explosion upon destruction


					
				}
	        }
	    }

	}
}








