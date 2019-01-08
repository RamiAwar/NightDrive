

function initialize_game(){

	var GAME = {};

	GAME.started = false;

	// Keep track of covered distance
	GAME.distance = 0;

	// Keep track of score
	GAME.score = 100; // increases on gift collection


	


	return GAME;


}

function start_game(GAME, car, road){

	GAME.started = true;

	road.spawn = true;

}

function update_game(){



}