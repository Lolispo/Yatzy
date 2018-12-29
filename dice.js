'use strict';

// Roll random number from 1 to 'sides'
function roll(sides) {
	return Math.round(Math.random() * (sides - 1) + 1);
}

// Create hand for a new turn
function Turn(amount, sides, rolls) {
	// Number of sides on the dice
	this.sidesDice = sides || 6;

	// Number of rolls left
	this.counter = rolls || 2;

	// Create array with dice
	this.dice = [];
	for (let i = amount || 5; i > 0; i--) {
		this.dice.push(roll(this.sidesDice));
	}
}

// Draw the dice on the 'table'
Turn.prototype.draw = function (table) {
	this.elm = [];
	this.locks = [];
	this.table = table;

	// Create html for every die
	for (let i = 0, l = this.dice.length; i < l; i++) {
		// Create html element for this die
		let die = document.createElement('div');
		die.setAttribute('value', this.dice[i]);
		die.classList.add('dice');
		this.elm.push(die);

		// Create a lock for this die
		let checker = document.createElement('input');
		checker.type = 'checkbox';
		this.locks.push(checker);
		die.appendChild(checker);

		// Put the die on the 'table'
		table.appendChild(die);
	}

	// Return this
	return this;
};

// Reroll unselected dice
Turn.prototype.reroll = function () {
	// Ignore request if all locks are checked or if counter has reached zero
	if (this.locks.every((lock) => lock.checked) || this.counter < 1) {
		console.error('Unable to reroll dice');
		return this;
	}

	// Increment counter
	this.counter --;

	// Reroll all selected dice
	for (let i = 0, l = this.locks.length; i < l; i++) {
		if (!this.locks[i].checked) {
			this.dice[i] = roll(this.sidesDice);
			this.elm[i].setAttribute('value', this.dice[i]);
		};
	}

	// Call 'onreroll' callback
	if (this.onreroll) this.onreroll();

	// Call 'onlast' callback when this is the last reroll
	if (this.counter < 1 && this.onlast) this.onlast();


	// Return this
	return this;
};

// Clean up 'table'
Turn.prototype.cleanup = function () {
	// Clear 'table' of dice
	this.elm.forEach((elm) => {
		this.table.removeChild(elm);
	});
			
	//!! Empty button callback and display attribute
	//!!this.button.onclick = null;
	//!!this.display.removeAttribute('value');
};

// Callback for every reroll
Turn.prototype.onreroll = null;

// Callback for last reroll
Turn.prototype.onlast = null;



// Map 'reroll' to a button
Turn.prototype.mapReroll = function (button, display) {
	// On reroll updates
	this.onreroll = () => {
		// Update display for rerolls
		if (display) display.setAttribute('value', this.counter);

		// Updates available options for results 
		diceToEvaluate(this.dice);
	};

	// Disable button on last reroll
	this.onlast = () => button.disabled = true;

	// Reroll unchecked dice on button press if maximum rerolls has not been reached
	button.onclick = () => this.reroll();

	// Display number of rerolls
	this.onreroll();

	// Return this
	return this;
};
