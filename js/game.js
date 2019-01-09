var road, car, GAME;

function initialize_game(){

	

	var GAME = {};

	GAME.started = false;


	// Set initial speed and current speed
	GAME.initial_speed = 0.005;
	GAME.speed = GAME.initial_speed;

	// Set level
	GAME.level = 0;

	GAME.health = 100;

	// Keep track of covered distance
	GAME.distance = 0;

	// Keep track of score
	GAME.score = 0; // increases on gift collection
	GAME.score_multiplier = 1;

	


	return GAME;


}

function start_game(GAME, car, road){

	//Show UI Components
	$('.stats').css("visibility", "visible");
	$('.menu').css("pointer-events", "none");

	$('#highscore').html(getCookie("highscore"));

	GAME.paused = false;
	GAME.started = true;
	GAME.level = 0;
	GAME.score = 0;
	GAME.distance = 0;
	GAME.initial_speed = 0.005;
	GAME.speed = GAME.initial_speed;
	GAME.score_multiplier = 1;
	GAME.health = 100;

	GAME.spawn_rate = 0.3;

	road = road;
	car = car;

	road.spawn = true;
	road.spawn_rate = GAME.spawn_rate;

	return GAME;

}

function increase_difficulty(GAME){

	// handle level increase mechanic
	GAME.speed += 0.001; 

	road.set_speed(GAME.speed);

	GAME.score_multiplier += 0.5;

	// DESIGN: Any new ideas for level increase?
	// 
	
	return GAME;

}


// TODO: Endgame condition 
function end_game(){


	// Check if beat high score
	var highscore = 0;

	var cookie = getCookie("highscore");

	if (cookie != null){

		console.log("Cookie already present");
		highscore = parseInt(cookie);

		// Update highscore cookie if current distance beats record
		if(highscore < GAME.distance){
			console.log("New highscore!");
			setCookie("highscore", GAME.distance, 100);
		}

	}else{ // Cookie does not exist, create for the first time
		console.log("Set cookie highscore to "+ toString(GAME.distance));
		setCookie("highscore", GAME.distance, 100);
	}

	road.spawn = false;
	GAME.started = false;
	GAME.ended = true;
	road.set_speed(0);

	// Hide UI components
	$('.stats').css("visibility", "hidden");

	// Show gameover screen
	$('#gameover').css("display", "inline");
	$('#gameover').css("pointer-events", "auto");


	// TODO: Handle this more neatly
	$('#gameover').click(function(){

		car.mesh.position.x = 0;
		start_game(GAME, car, road);

	});


}

// Handle menu button
$(document).on('keyup',function(evt) {
    if (evt.keyCode == 27) {
    	console.log("test");
        toggle_menu_modal();
    }
});

$("#settings").click(function(){

	toggle_menu_modal();
});

function toggle_menu_modal(){

	$('#settings-modal').modal('toggle');

}

$('#settings-modal').on('hidden.bs.modal', function (e) {
  	
 	GAME.paused = false;

});

$('#settings-modal').on('show.bs.modal', function (e) {

	GAME.paused = true;
})