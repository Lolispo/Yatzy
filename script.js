'use strict';

const names = [
	['num1', 'Ones'],
	['num2', 'Twoes'],
	['num3', 'Threes'],
	['num4', 'Fours'],
	['num5', 'Fives'],
	['num6', 'Sixes'],
	['pair', 'Pair'],
	['dpair', 'Double Pair'],
	['triple', 'Triple'],
	['quad', 'Quadruple'],
	['sladder', 'Small Ladder'],
	['bladder', 'Big Ladder'],
	['fullHouse', 'Full House'],
	['yatzy', 'Yatzy'],
	['chance', 'Chance']
];

const mapNames = new Map(names);

const ID_RESULT = 'result';
const ID_SUBMIT_BUTTON_DIV = 'submitButtonDiv';
const ID_SUBMIT_BUTTON = 'submitButton';
const ID_PLAYER_SCORE = 'pScore_';

const TEXT_SAVE = 'Spara';

let players = [];
let activePlayer = 0;
let hand;

function start(){
	createPlayer('P1');
	createPlayer('P2');
	activePlayer = 0;
	startTurn();
	/*
	fillResult(ID_RESULT, evaluate(getActivePlayer(), [1,2,3,4,5]));
	prettyPrint('*** Testing evaluate for [1,2,3,4,5]: ', evaluate([1,2,3,4,5]));
	prettyPrint('*** Testing evaluate for [2,2,3,3,3]: ', evaluate([2,2,3,3,3]));
	prettyPrint('*** Testing evaluate for [5,5,5,5,6]: ', evaluate([5,5,5,5,6]));
	*/
}

function startTurn(){
	if (hand) {
		// Re-enable button
		document.querySelector('#reroll').disabled = false;

		hand.cleanup();
	}
	hand = new Turn();
	hand.draw(document.querySelector('#table'));
	hand.mapReroll(document.querySelector('#reroll'), document.querySelector('#counter'));
}

function evaluate(player, hand){
	let results = [];
	let numbers = [0, 0, 0, 0, 0, 0];
	for(let i = 0; i < hand.length; i++){
		numbers[hand[i]-1]++;
	}
	for(let i = 0; i < numbers.length; i++){
		if(numbers[i] != 0) {
			let tempArr = [];
			let tempScore = 0;
			for(let j = 0; j < numbers[i]; j++){
				tempArr.push(i+1);
				tempScore += i+1;
			}
			addResult(results, player, 'num'+(i+1), tempArr, tempScore);
		}
	}
	for(let i = 0; i < numbers.length; i++){
		if(numbers[i] != 0) {
			if(numbers[i] > 1){
				addResult(results, player, 'pair', [i+1, i+1], (i+1)*2);
				if(numbers[i] > 2){
					addResult(results, player, 'triple', [i+1, i+1, i+1], (i+1)*3);
					if(numbers[i] > 3){
						addResult(results, player, 'quad', [i+1, i+1, i+1, i+1], (i+1)*4);
						if(numbers[i] > 4){
							addResult(results, player, 'yatzy', hand, 50);
						}
					}
					// Full House
					if(numbers[i] === 3){
						for(let j = 0; j < numbers.length; j++){
							if(numbers[j] == 2){
								addResult(results, player, 'fullHouse', hand, sum(hand));
							}
						}
					}
				}
				// Double Pair
				let dSum = 2*(i+1);
				let tempArr = [i+1, i+1];
				for(let j = i+1; j < numbers.length; j++){
					if(numbers[j] > 1){
						dSum += 2*(j+1);
						tempArr.push(j+1);
						tempArr.push(j+1);
						addResult(results, player, 'dpair', tempArr, dSum);
					}
				}
			}
		}
	}

	// Ladders
	if(numbers[1] != 0 && numbers[2] != 0 && numbers[3] != 0 && numbers[4] != 0){
		if(numbers[0] != 0){
			addResult(results, player, 'sladder', hand, 15);
		}
		if(numbers[5] != 0){
			addResult(results, player, 'bladder', hand, 20);
		}
	}
	// Chance
	addResult(results, player, 'chance', hand, sum(hand));
	return results;
}

function sum(array){
	let sum = 0;
	for(let i = 0; i < array.length; i++){
		sum += array[i];
	}
	return sum;
}

function addResult(result, player, name, array, score){
	// Can add functionality on string here, <b> </b> or something
	if(player[name] === -1){
		let stringName = mapNames.get(name);
		result.push({
			name: name,
			stringName: stringName,
			array: array,
			score: score,
			string: stringName + ' [' + array + '] = ' + score
		});
	}
}

function prettyPrint(string, result){
	console.log(string);
	for(let i = 0; i < result.length; i++){
		console.log(result[i].string);
	}
}

function createPlayer(name){
	players.push(new Player(name));
	let div = document.createElement('div');
	div.id = ID_PLAYER_SCORE + name;
	document.getElementById('playerScore').appendChild(div);
}

function diceToEvaluate(array){
	cleanResult();
	fillResult(ID_RESULT, evaluate(getActivePlayer(), array));
}

function fillResult(id, result){
	// Generate list elements
	for(let i = 0; i < result.length; i++){
		let string = result[i].string;
		let type = result[i].name;
		let div = document.createElement('div');
		//div.id = ID_SUBMIT_BUTTON;
		div.classList.add('radio');
		let label = document.createElement('label');
		let input = document.createElement('input');
		input.type = 'radio';
		input.name = 'choice';
		input.value = string;
		input.setAttribute('onchange', 'makeButton(ID_SUBMIT_BUTTON, ID_SUBMIT_BUTTON_DIV, ' + JSON.stringify(result[i]) + ')'); // ,' + result[i] + ')');
		//input.outerHTML = string;
		label.innerHTML = string;
		div.appendChild(input);
		div.appendChild(label);
		document.getElementById(id).appendChild(div);
	}
}

function makeButton(id, parentID, obj){
	if(document.getElementById(id) != null){
		var handEl = document.getElementById(parentID); // Remove the button from parentID with id = id
		handEl.removeChild(document.getElementById(id));
	}
	// Create new Button
	var el = document.getElementById(parentID);
	var button = document.createElement('button');
	button.type = 'button';
	button.innerHTML = TEXT_SAVE;
	button.id = id;
	el.appendChild(button);
	button.addEventListener('click', function(){
		// Get player
		let player = getActivePlayer();
		player.setEntry(obj.name, obj.score);
		cleanResult(id, parentID);
		checkEnd(player);
		changeTurn();
		startTurn();
	});
}

// Changes activeplayer to next player in order
// When @ top index, goes to 0
function changeTurn(){
	if(activePlayer + 1 >= players.length){
		activePlayer = 0;
	} else {
		activePlayer++;
	}
}

function cleanResult(id, parentID){
	if(id === undefined){
		id = ID_SUBMIT_BUTTON;
	}
	if(parentID === undefined){
		parentID = ID_SUBMIT_BUTTON_DIV;
	}
	var el = document.getElementById(ID_RESULT);
	for(var i = el.childNodes.length-1; i >= 0; i--){
		el.removeChild(el.childNodes[i]);
	}
	var handEl = document.getElementById(parentID); // Remove the button from parentID with id = id
	if(handEl.childNodes.length > 0){
		handEl.removeChild(document.getElementById(id));
	}
}

function checkEnd(player){
	let totalScore = player.totalScore();
	if(player.isFinished()){
		console.log(player.name + ' filled all entries');
		document.getElementById(ID_PLAYER_SCORE + player.name).innerHTML = player.name + ' Final Score: ' + totalScore;
	} else {
		document.getElementById(ID_PLAYER_SCORE + player.name).innerHTML = player.name + ' score: ' + totalScore;
	}
}

function getActivePlayer(){
	return players[activePlayer];
}

function Player(name){
	this.name = name;
	this.num1 = -1;
	this.num2 = -1;
	this.num3 = -1;
	this.num4 = -1;
	this.num5 = -1;
	this.num6 = -1;
	this.pair = -1;
	this.dpair = -1;
	this.triple = -1;
	this.quad = -1;
	this.sladder = -1;
	this.bladder = -1;
	this.fullHouse = -1;
	this.yatzy = -1;
	this.chance = -1;

	this.bonus = function(){
		let sum = 0;
		sum += this.num1;
		sum += this.num2;
		sum += this.num3;
		sum += this.num4;
		sum += this.num5;
		sum += this.num6;
		return (sum >= 63 ? 50 : 0);
	}

	this.setEntry = function(type, score){
		console.log('Setting entry (' + this.name + ') for type ' + type + ': ' + score);
		this[type] = score;
	}

	this.isFinished = function(){
		return this.num1 != -1 && this.num2 != -1 && this.num3 != -1 && this.num4 != -1 && this.num5 != -1 && this.num6 != -1
		 	&& this.pair != -1 && this.dpair != -1 && this.triple != -1 && this.quad != -1 && this.sladder != -1 && this.bladder != -1 && this.fullHouse != -1
		 	&& this.yatzy != -1 && this.chance != -1;
	}

	this.totalScore = function(){
		var total = (this.num1 != -1 ? this.num1 : 0)
		+ (this.num2 != -1 ? this.num2 : 0)
		+ (this.num3 != -1 ? this.num3 : 0)
		+ (this.num4 != -1 ? this.num4 : 0)
		+ (this.num5 != -1 ? this.num5 : 0)
		+ (this.num6 != -1 ? this.num6 : 0)
		+ (this.pair != -1 ? this.pair : 0)
		+ (this.dpair != -1 ? this.dpair : 0)
		+ (this.triple != -1 ? this.triple : 0)
		+ (this.quad != -1 ? this.quad : 0)
		+ (this.sladder != -1 ? this.sladder : 0)
		+ (this.bladder != -1 ? this.bladder : 0)
		+ (this.fullHouse != -1 ? this.fullHouse : 0)
		+ (this.yatzy != -1 ? this.yatzy : 0)
		+ (this.chance != -1 ? this.chance : 0)
		+ this.bonus();
		return total;
	}
}
