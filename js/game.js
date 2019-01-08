

function initialize_game(){

	var GAME = {};

	GAME.started = false;

	// Keep track of covered distance
	GAME.distance = 0;

	// Keep track of score
	GAME.score = 0; // increases on gift collection


	// road.spawn = true;



	return GAME;


}

function start_game(GAME, car, road){

	GAME.started = true;

}

function update_game(){



}